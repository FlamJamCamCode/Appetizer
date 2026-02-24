#!/usr/bin/env Rscript

# Altruism Data Pipeline (Scaffold)
#
# This script is a scaffold for building a large-scale, iterative data ingestion
# and transformation pipeline to support the mega altruism study described in
# `altruism-mega-appendix.md`.
#
# It is intentionally modular and can be extended over time to add:
# - More countries
# - More years
# - More indicators (social spending, ODA, private giving, etc.)
#
# Many functions below are stubs with TODO notes indicating where to insert
# real API calls, file reads, or data merges.

SuppressPackageStartupMessages <- suppressPackageStartupMessages
SuppressPackageStartupMessages({
  library(dplyr)
  library(readr)
  library(tidyr)
  library(purrr)
})

# Set up an output directory relative to this script location.
# More robust than relying on parent.frame()$ofile, which can be missing.
get_base_dir <- function() {
  # Try to infer the script path from commandArgs (works with Rscript)
  cmd_args <- commandArgs(trailingOnly = FALSE)
  file_arg <- cmd_args[grepl("^--file=", cmd_args)]
  if (length(file_arg) == 1L) {
    this_file <- sub("^--file=", "", file_arg)
    return(dirname(normalizePath(this_file, winslash = "/", mustWork = FALSE)))
  }

  # Fallback: if run interactively or path not available, use working directory
  getwd()
}

BASE_DIR <- get_base_dir()
DATA_DIR <- file.path(BASE_DIR, "data")
dir.create(DATA_DIR, showWarnings = FALSE, recursive = TRUE)

message("Base directory: ", BASE_DIR)
message("Data directory: ", DATA_DIR)


# ------------------------------------------------------------------------------
# 1. Country metadata
# ------------------------------------------------------------------------------

country_metadata <- tibble::tibble(
  country_code = c("USA", "GBR", "DEU", "FRA", "SWE", "NOR", "CAN", "JPN", "KOR",
                   "SGP", "MCO", "ARE", "SAU", "CHN", "IND", "NGA", "BGD", "MEX"),
  country_name = c("United States", "United Kingdom", "Germany", "France", "Sweden",
                   "Norway", "Canada", "Japan", "South Korea", "Singapore", "Monaco",
                   "United Arab Emirates", "Saudi Arabia", "China", "India",
                   "Nigeria", "Bangladesh", "Mexico"),
  region = c(
    "North America", "Western Europe", "Western Europe", "Western Europe",
    "Northern Europe", "Northern Europe", "North America", "East Asia",
    "East Asia", "East Asia", "Western Europe", "Middle East", "Middle East",
    "East Asia", "South Asia", "Sub-Saharan Africa", "South Asia", "Latin America"
  ),
  income_group = c(
    "High", "High", "High", "High", "High", "High", "High", "High",
    "High", "High", "High", "High", "High", "Upper-middle", "Lower-middle",
    "Lower-middle", "Lower-middle", "Upper-middle"
  )
)

readr::write_csv(country_metadata, file.path(DATA_DIR, "country_metadata.csv"))


# ------------------------------------------------------------------------------
# 2. Placeholders for macroeconomic data (to be replaced with real pulls)
# ------------------------------------------------------------------------------

build_macro_placeholder <- function() {
  # Placeholder values broadly consistent with ranges mentioned in the appendix.
  tibble::tibble(
    country_code = country_metadata$country_code,
    year = 2023L,
    gdp_per_capita_usd = c(
      78000, 48000, 52000, 47000, 58000, 85000, 52000, 42000, 40000,
      78000, 190000, 43000, 27000, 13000, 2500, 2500, 2500, 10000
    ),
    population_total_m = c(
      333, 67, 83, 65, 10, 5, 39, 125, 52,
      6, 0.04, 10, 36, 1410, 1410, 216, 170, 130
    ),
    gdp_current_usd_b = gdp_per_capita_usd * population_total_m / 1000
  )
}

macro_placeholder <- build_macro_placeholder()
readr::write_csv(macro_placeholder, file.path(DATA_DIR, "macro_placeholder_2023.csv"))


# ------------------------------------------------------------------------------
# 3. Placeholders for social spending and ODA (to be replaced with real pulls)
# ------------------------------------------------------------------------------

build_social_spend_placeholder <- function() {
  tibble::tibble(
    country_code = country_metadata$country_code,
    year = 2023L,
    social_spend_pct_gdp = c(
      22, 23, 27, 31, 27, 27, 20, 23, 15,
      12, NA, NA, NA, 12, 8, 5, 7, 12
    ),
    oda_donor_pct_gni = c(
      0.22, 0.6, 0.7, 0.5, 0.9, 1.0, 0.35, 0.25, 0.16,
      0.1, NA, 0.7, 0.7, 0.1, 0.05, 0.0, 0.0, 0.0
    )
  )
}

social_spend_placeholder <- build_social_spend_placeholder()
readr::write_csv(social_spend_placeholder, file.path(DATA_DIR, "social_spend_placeholder_2023.csv"))


# ------------------------------------------------------------------------------
# 4. Skeleton for private giving and CAF World Giving Index integration
# ------------------------------------------------------------------------------

build_private_giving_placeholder <- function() {
  tibble::tibble(
    country_code = country_metadata$country_code,
    year = 2023L,
    private_giving_pct_gdp = c(
      1.8, 0.8, 0.3, 0.3, 0.7, 0.7, 0.6, 0.15, 0.1,
      0.5, NA, NA, NA, 0.1, NA, NA, NA, 0.2
    ),
    caf_giving_rank = NA_integer_
  )
}

private_giving_placeholder <- build_private_giving_placeholder()
readr::write_csv(private_giving_placeholder, file.path(DATA_DIR, "private_giving_placeholder_2023.csv"))


# ------------------------------------------------------------------------------
# 5. Join into a country-level summary for scenario comparison
# ------------------------------------------------------------------------------

country_summary <- country_metadata %>%
  left_join(macro_placeholder, by = "country_code") %>%
  left_join(social_spend_placeholder, by = c("country_code", "year")) %>%
  left_join(private_giving_placeholder, by = c("country_code", "year"))

readr::write_csv(country_summary, file.path(DATA_DIR, "country_summary_2023_placeholder.csv"))


# ------------------------------------------------------------------------------
# 6. TODO: Hooks for real data ingestion
# ------------------------------------------------------------------------------

# TODO (user/analyst to complete over time):
# - Add functions that call:
#     - World Bank API for GDP, GNI, population:
#       e.g. wbstats::wb() or direct HTTP queries.
#     - OECD SOCX data (via CSV downloads or API).
#     - OECD DAC ODA statistics.
#     - CAF World Giving Index (from reports or structured data if available).
# - Replace the placeholder-builders above with real data pulls.
# - Extend time coverage (multiple years) and add trend analysis.

message("Altruism data pipeline scaffold has written placeholder CSV files to: ", DATA_DIR)


