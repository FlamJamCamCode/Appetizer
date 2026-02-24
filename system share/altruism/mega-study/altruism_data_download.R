#!/usr/bin/env Rscript

# Altruism Data Download Script
#
# This script is designed to pull *real* data from official sources and
# write them into the `data/` subfolder so that the rest of the altruism
# pipeline can use empirical inputs instead of placeholders.
#
# It focuses on:
# - World Bank (GDP, GNI, population, GDP per capita)
# - OECD (social expenditure, ODA) for OECD countries
# - Creates CSVs that mirror the placeholder structures in
#   `altruism_data_pipeline.R`
#
# NOTES:
# - You may need to install some packages first:
#     install.packages(c("wbstats", "OECD", "dplyr", "readr", "tidyr", "purrr"))
# - OECD endpoints sometimes change; you might need to adjust dataset codes
#   or filter expressions over time.

SuppressPackageStartupMessages <- suppressPackageStartupMessages
SuppressPackageStartupMessages({
  library(wbstats)
  library(OECD)
  library(dplyr)
  library(readr)
  library(tidyr)
  library(purrr)
  library(httr)
  # oecdoda is optional; we will check for it before using
  oecdoda_available <- requireNamespace("oecdoda", quietly = TRUE)
})

# ---------------------------------------------------------------------------
# Helper: base/data directories
# ---------------------------------------------------------------------------

get_base_dir <- function() {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- args[grepl("^--file=", args)]
  if (length(file_arg) == 1L) {
    this_file <- sub("^--file=", "", file_arg)
    return(dirname(normalizePath(this_file, winslash = "/", mustWork = FALSE)))
  }
  getwd()
}

BASE_DIR <- get_base_dir()
DATA_DIR <- file.path(BASE_DIR, "data")
dir.create(DATA_DIR, showWarnings = FALSE, recursive = TRUE)

message("Base directory: ", BASE_DIR)
message("Data directory: ", DATA_DIR)


# ---------------------------------------------------------------------------
# Helper: robust download with mirrors / fallbacks
# ---------------------------------------------------------------------------

robust_download <- function(urls, destfile, use_web_archive = FALSE) {
  # urls: character vector of primary + mirror URLs to try in order.
  # If use_web_archive = TRUE and all fail, attempt a Web Archive snapshot.
  last_err <- NULL
  for (u in urls) {
    message("Trying URL: ", u)
    resp <- tryCatch(
      httr::GET(u, httr::timeout(60)),
      error = function(e) e
    )
    if (inherits(resp, "error")) {
      message("  -> Request error: ", conditionMessage(resp))
      last_err <- resp
      next
    }
    status <- httr::status_code(resp)
    if (status >= 200 && status < 300) {
      bin <- httr::content(resp, as = "raw")
      writeBin(bin, destfile)
      message("  -> Downloaded successfully to: ", destfile)
      return(TRUE)
    } else {
      message("  -> HTTP status ", status, " for ", u)
      last_err <- status
    }
  }

  if (use_web_archive) {
    message("All primary/mirror URLs failed. Attempting Web Archive...")
    # Very simple Wayback attempt: ask for the latest snapshot and then download it.
    # NOTE: Web Archive availability is not guaranteed; this is best-effort.
    base_url <- urls[[1]]
    api_url <- paste0("https://web.archive.org/web/*/", base_url)
    message("  -> Querying Wayback index: ", api_url)
    # We keep this minimal; a more complete implementation would parse the CDX API.
    resp_idx <- tryCatch(httr::GET(api_url, httr::timeout(60)), error = identity)
    if (!inherits(resp_idx, "error") && httr::status_code(resp_idx) == 200) {
      # Heuristic: use the original URL prepended by /web/0/ to get latest.
      wb_url <- paste0("https://web.archive.org/web/0/", base_url)
      message("  -> Trying Wayback snapshot: ", wb_url)
      resp_wb <- tryCatch(httr::GET(wb_url, httr::timeout(60)), error = identity)
      if (!inherits(resp_wb, "error") && httr::status_code(resp_wb) %in% 200:299) {
        bin <- httr::content(resp_wb, as = "raw")
        writeBin(bin, destfile)
        message("  -> Downloaded from Web Archive to: ", destfile)
        return(TRUE)
      } else {
        message("  -> Wayback snapshot failed or unavailable.")
      }
    } else {
      message("  -> Wayback index request failed or unavailable.")
    }
  }

  message("All attempts to download failed. Last error: ", paste(last_err, collapse = " "))
  FALSE
}


# ---------------------------------------------------------------------------
# 1. Load country metadata (from existing CSV or define here)
# ---------------------------------------------------------------------------

country_meta_path <- file.path(DATA_DIR, "country_metadata.csv")
if (file.exists(country_meta_path)) {
  country_metadata <- readr::read_csv(country_meta_path, show_col_types = FALSE)
} else {
  country_metadata <- tibble::tibble(
    country_code = c("USA", "GBR", "DEU", "FRA", "SWE", "NOR", "CAN", "JPN", "KOR",
                     "SGP", "MCO", "ARE", "SAU", "CHN", "IND", "NGA", "BGD", "MEX"),
    country_name = c("United States", "United Kingdom", "Germany", "France", "Sweden",
                     "Norway", "Canada", "Japan", "South Korea", "Singapore", "Monaco",
                     "United Arab Emirates", "Saudi Arabia", "China", "India",
                     "Nigeria", "Bangladesh", "Mexico")
  )
}

# ---------------------------------------------------------------------------
# 2. World Bank data: GDP, GNI, population, GDP per capita
# ---------------------------------------------------------------------------

macro_path <- file.path(DATA_DIR, "macro_worldbank_2000_2023.csv")

if (file.exists(macro_path)) {
  message("World Bank macro file already exists: ", macro_path)
  message("  -> Skipping re-download (delete the file if you want a fresh pull).")
} else {
  message("Downloading World Bank data (this may take a little while)...")

  wb_indicators <- c(
    gdp = "NY.GDP.MKTP.CD",
    gni = "NY.GNP.MKTP.CD",
    gdp_per_capita = "NY.GDP.PCAP.CD",
    population = "SP.POP.TOTL"
  )

  wb_raw <- wbstats::wb_data(
    indicator = wb_indicators,
    country = "all",
    start_date = 2000,
    end_date = 2023,
    return_wide = TRUE
  )

  macro_real <- wb_raw %>%
    transmute(
      country_code = iso3c,
      year = as.integer(date),
      gdp_current_usd = gdp,
      gni_current_usd = gni,
      gdp_per_capita_usd = gdp_per_capita,
      population_total = population
    ) %>%
    arrange(country_code, year)

  readr::write_csv(macro_real, macro_path)
  message("  -> Saved World Bank macro data to: ", macro_path)
}


# ---------------------------------------------------------------------------
# 3. OECD SOCX social expenditure (for OECD countries)
# ---------------------------------------------------------------------------

message("Downloading OECD SOCX data (social expenditure)...")

oecd_socx <- tryCatch(
  {
    OECD::get_dataset(
      dataset = "SOCX_AGG",
      filter = list(
        "SOCX_AGG" = "TOT",   # total social expenditure
        "AGGREGATE" = "TOT"   # total
      ),
      start_time = 2000,
      end_time = 2023
    )
  },
  error = function(e) {
    message("SOCX download failed: ", conditionMessage(e))
    NULL
  }
)

if (!is.null(oecd_socx)) {
  socx_path <- file.path(DATA_DIR, "social_spend_oecd_socx_raw.csv")
  if (file.exists(socx_path)) {
    message("SOCX raw file already exists: ", socx_path)
    message("  -> Skipping re-write (delete the file if you want a fresh pull).")
  } else {
    # Schema of SOCX_AGG can vary; for now, write the raw dataset so that it can
    # be inspected and transformed later in a more targeted way.
    socx_tbl <- as_tibble(oecd_socx)
    readr::write_csv(socx_tbl, socx_path)
    message("  -> Saved SOCX raw data to: ", socx_path)
  }
} else {
  message("Skipping SOCX CSV write due to download error.")
}


# ---------------------------------------------------------------------------
# 4. OECD DAC ODA data (donor aid)
# ---------------------------------------------------------------------------

message("Downloading OECD DAC ODA (DAC1)...")

if (exists("oecdoda_available") && isTRUE(oecdoda_available)) {
  message("  -> Using oecdoda package to retrieve DAC1 data...")
  # SAFETY: wrap in tryCatch so failures don't break the whole script.
  dac1_res <- tryCatch(
    {
      # oecdoda::get_dac() has various helpers; here we assume a function
      # that can fetch DAC1 by donor/year. This may need adjustment based
      # on the exact package API.
      df <- oecdoda::get_dac_table("DAC1")
      as_tibble(df)
    },
    error = function(e) {
      message("  -> oecdoda DAC1 retrieval failed: ", conditionMessage(e))
      NULL
    }
  )

  if (!is.null(dac1_res)) {
    readr::write_csv(dac1_res, file.path(DATA_DIR, "oda_donor_oecd_dac1_oecdoda_raw.csv"))
    message("  -> Saved raw DAC1 (oecdoda) to: ", file.path(DATA_DIR, "oda_donor_oecd_dac1_oecdoda_raw.csv"))
  } else {
    message("  -> oecdoda is available but DAC1 retrieval failed; consider manual download.")
  }
} else {
  message("  -> Package 'oecdoda' not installed; skipping automated DAC1 download.")
  message("     You can either install it (install.packages('oecdoda')) or download DAC1 from OECD.Stat manually.")
}


# ---------------------------------------------------------------------------
# 5. Notes on CAF World Giving Index and other data
# ---------------------------------------------------------------------------

# CAF World Giving Index data are typically published as reports or spreadsheets.
# There is no official R API at the time of writing, so integrating CAF data
# normally involves:
# - Downloading the Excel/CSV file from CAF's website.
# - Placing it inside the `data/` folder.
# - Writing a small parser to extract:
#     - % donating money
#     - % volunteering time
#     - % helping a stranger
#
# That parser can live either in this script or in `altruism_data_pipeline.R`.

message("Download script finished. Real macro/social/ODA data (where available) are now in: ", DATA_DIR)


