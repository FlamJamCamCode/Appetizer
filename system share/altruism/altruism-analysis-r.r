# Transformative Altruism Scenarios: Comprehensive R Analysis
# Including Government Spending Context
# Author: Economic Analysis Framework
# Date: 2025

# Load required libraries
library(tidyverse)
library(ggplot2)
library(scales)
library(patchwork)
library(viridis)
library(ggridges)
library(treemapify)
library(plotly)
library(forcats)

# Set theme
theme_set(theme_minimal(base_size = 12))

# ============================================================================
# PART 1: DATA SETUP - VERIFIED BASELINE DATA
# ============================================================================

# Current Reality - USA Verified Data (2024)
current_giving <- list(
  total_billions = 592.5,
  gdp_trillions = 29.6,
  pct_gdp = 2.0,
  population_millions = 333,
  per_capita = 1775
)

# Income Percentile Giving Rates (Verified & Estimated)
giving_by_percentile <- tibble(
  percentile = c(0.1, 1, 10, 25, 50, 75, 90, 95, 99, 99.9),
  giving_rate = c(8.6, 8.0, 3.5, 3.0, 2.0, 1.8, 1.5, 1.3, 1.0, 0.8),
  income_level = c(2800000, 785000, 200000, 120000, 61000, 
                   48000, 38000, 32000, 25000, 20000),
  verified = c(TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE)
)

# International Charitable Giving (Verified from CAF)
intl_giving <- tibble(
  country = c("USA", "UK", "Canada", "Netherlands", "Germany", 
              "Australia", "Singapore", "Japan", "South Korea",
              "Indonesia", "Kenya", "India", "China"),
  pct_gdp = c(2.0, 0.54, 0.77, 0.56, 0.17, 
              0.38, 0.29, 0.14, 0.22,
              0.20, 0.25, 0.30, 0.08),
  gdp_per_capita = c(80000, 48000, 52000, 58000, 51000,
                     64000, 82000, 42000, 35000,
                     4900, 2100, 2700, 12500),
  region = c("West", "West", "West", "West", "West",
             "West", "Asia", "Asia", "Asia",
             "Asia", "Africa", "Asia", "Asia"),
  verified = c(TRUE, TRUE, TRUE, TRUE, TRUE,
               FALSE, TRUE, TRUE, TRUE,
               FALSE, FALSE, FALSE, FALSE)
)

# OECD Social Spending (Verified)
social_spending <- tibble(
  country = c("France", "Austria", "Finland", "Italy", "Germany",
              "Sweden", "Norway", "Denmark", "USA", "UK", 
              "Canada", "Australia", "Japan", "South Korea"),
  public_pct = c(30.0, 30.3, 30.1, 30.0, 26.7,
                 26.1, 25.3, 27.2, 23.0, 21.5,
                 21.3, 18.0, 22.3, 14.9),
  private_pct = c(2.8, 1.8, 1.2, 1.5, 3.3,
                  2.7, 1.6, 2.1, 12.8, 6.2,
                  4.8, 5.3, 2.9, 1.8)
) %>%
  mutate(total_pct = public_pct + private_pct)

# COMPREHENSIVE GOVERNMENT SPENDING DATABASE
govt_spending_full <- tibble(
  country = c("France", "Austria", "Finland", "Denmark", "USA", 
              "Germany", "Sweden", "UK", "Norway", "Canada",
              "Italy", "Netherlands", "Japan", "Australia", "South Korea",
              "Singapore", "China", "UAE", "Saudi Arabia", "Israel",
              "Brazil", "Mexico", "Russia", "Turkey", "India",
              "Indonesia", "Kenya", "Nigeria", "South Africa"),
  
  # Social spending
  social_spending_pct = c(32.8, 32.1, 31.3, 29.3, 30.1,
                          30.0, 28.8, 27.7, 26.9, 26.1,
                          31.5, 25.3, 25.2, 23.3, 16.7,
                          9, 10, 15, 19, 17,
                          17, 11.5, 19, 12, 3.5,
                          4.5, 10, 5, 17),
  
  # Healthcare
  healthcare_pct = c(11.3, 11.4, 9.5, 10.5, 16.0,
                     11.7, 10.9, 10.2, 11.4, 10.8,
                     9.0, 11.0, 10.9, 9.9, 8.4,
                     4.5, 3.3, 3.2, 5.0, 7.5,
                     4.0, 2.5, 3.5, 4.5, 1.3,
                     1.4, 2.0, 1.2, 4.3),
  
  # Education
  education_pct = c(5.3, 5.3, 6.2, 6.4, 4.9,
                    4.6, 6.6, 4.2, 6.7, 5.0,
                    4.3, 5.0, 3.2, 5.3, 4.5,
                    2.9, 4.0, 1.0, 7.5, 6.0,
                    6.0, 4.0, 3.5, 4.0, 2.9,
                    3.6, 5.3, 2.0, 6.5),
  
  # Foreign aid given (% GNI)
  foreign_aid_pct_gni = c(0.52, 0.26, 0.38, 0.71, 0.22,
                          0.83, 0.99, 0.54, 1.02, 0.34,
                          0.29, 0.63, 0.36, 0.19, 0.16,
                          0.03, 0.05, 1.0, 0.4, 0.05,
                          0.05, 0.02, 0.05, 0.8, 0.08,
                          0.02, NA, NA, 0.05),
  
  # Foreign aid absolute (billions USD)
  foreign_aid_billions = c(15.4, 1.4, 1.4, 3.2, 71.9,
                           32.4, 7.4, 18.0, 6.3, 7.4,
                           5.8, 6.3, 16.8, 3.1, 2.8,
                           0.3, 7, 5, 6, 0.15,
                           0.3, 0.08, 0.8, 9, 1.8,
                           0.3, NA, NA, 0.3),
  
  # Charitable giving
  charitable_pct = c(0.4, 0.3, 0.3, 0.4, 2.0,
                     0.17, 0.4, 0.54, 0.5, 0.77,
                     0.2, 0.56, 0.14, 0.38, 0.22,
                     0.29, 0.06, 0.5, 0.3, 0.3,
                     0.20, 0.15, 0.26, 0.3, 0.30,
                     0.20, 0.25, 0.20, 0.20),
  
  # Public sector wages (estimated)
  public_wages_pct = c(9, 8, 10, 10, 5.2,
                       7, 9, 8, 8, 7,
                       9, 7, 6.1, 6, 4.8,
                       10, 5.5, 11, 13.5, 7,
                       12, 8, 8, 7, 5.5,
                       6, 8, 6, 11),
  
  # Defense spending
  defense_pct = c(1.9, 0.7, 1.5, 1.4, 3.5,
                  1.5, 1.7, 2.3, 1.6, 1.3,
                  1.5, 1.5, 1.0, 2.1, 2.8,
                  3.0, 1.7, 5.6, 8.0, 4.5,
                  1.5, 0.6, 4.0, 2.7, 2.4,
                  0.8, 1.5, 0.5, 1.2),
  
  # Region classification
  region = c(rep("Western Europe", 4), "North America",
             rep("Western Europe", 5), "North America",
             rep("Western Europe", 2), rep("Asia-Pacific", 3),
             rep("Middle East", 3),
             rep("Latin America", 2), rep("Eurasia", 2),
             rep("South Asia", 2),
             "East Africa", "West Africa", "Southern Africa"),
  
  # Income classification
  income_class = c(rep("High", 15), "High", "Upper-Middle", "High", "High", "High",
                   "Upper-Middle", "Upper-Middle", "Upper-Middle", "Upper-Middle",
                   "Lower-Middle", "Lower-Middle", "Lower-Middle", "Lower-Middle", "Upper-Middle")
) %>%
  mutate(
    total_redistribution = social_spending_pct + charitable_pct + foreign_aid_pct_gni,
    verified = country %in% c("France", "Germany", "USA", "UK", "Japan", "Canada",
                              "Australia", "Sweden", "Norway", "Denmark")
  )

# Foreign Aid by Sector (USA as detailed example)
usa_foreign_aid_sectors <- tibble(
  sector = c("Humanitarian", "HIV/AIDS", "Peace & Security", "Economic Development",
             "Health (Other)", "Military Aid", "Democracy/Governance", "Education",
             "Multi-sector", "Other"),
  billions = c(15.6, 10.6, 12.9, 12.9, 3.1, 8.2, 2.3, 2.0, 2.9, 1.4),
  percentage = c(21.7, 14.7, 18.0, 18.0, 4.3, 11.4, 3.2, 2.8, 4.0, 1.9)
) %>%
  mutate(sector = fct_reorder(sector, billions))

# Top Foreign Aid Recipients
top_aid_recipients <- tibble(
  country = c("Ukraine", "Israel", "Egypt", "Jordan", "Kenya",
              "Nigeria", "Ethiopia", "Afghanistan", "Syria", "Yemen"),
  aid_billions = c(26.4, 3.3, 1.4, 1.3, 1.0, 0.9, 0.9, 0.8, 0.8, 0.7),
  primary_purpose = c("Security/Humanitarian", "Military", "Camp David",
                      "Regional Stability", "Health", "Security/Health",
                      "Humanitarian", "Humanitarian", "Humanitarian", "Humanitarian")
) %>%
  mutate(country = fct_reorder(country, aid_billions))

# ============================================================================
# PART 2: SCENARIO MODELING - GRANULAR LEVELS
# ============================================================================

# Scenario 1: Angels of Man - Granular Distribution Shift
angels_scenario <- tibble(
  percentile = seq(0.1, 99.9, by = 0.1)
) %>%
  mutate(
    current_rate = case_when(
      percentile <= 1 ~ 8 + (1 - percentile) * 0.5,
      percentile <= 10 ~ 3.5 + (10 - percentile) * 0.5,
      percentile <= 50 ~ 2.0 + (50 - percentile) * 0.04,
      TRUE ~ 1.5 - (percentile - 50) * 0.01
    ),
    angels_rate = lag(current_rate, n = 100, default = 0.5)
  ) %>%
  mutate(angels_rate = pmax(angels_rate, 2.5))

angels_avg_rate <- mean(angels_scenario$angels_rate, na.rm = TRUE)

# Scenario 2: Working Men Scenarios - Granular Participation Rates
working_men_scenarios <- expand_grid(
  participation_pct = seq(5, 50, by = 5),
  income_dedication_pct = seq(10, 90, by = 10)
) %>%
  mutate(
    working_men = 100e6,
    participants = working_men * (participation_pct / 100),
    avg_income = 65000,
    annual_per_person = avg_income * (income_dedication_pct / 100),
    total_billions = (participants * annual_per_person) / 1e9,
    pct_gdp = (total_billions / current_giving$gdp_trillions) * 100,
    vs_current = total_billions / current_giving$total_billions,
    vs_foreign_aid = total_billions / 71.9,
    vs_education = total_billions / 1450
  )

# Scenario 3: Wealth Contribution Scenarios
wealth_scenarios <- expand_grid(
  participation_pct = seq(5, 50, by = 5),
  wealth_dedication_pct = seq(10, 100, by = 10)
) %>%
  mutate(
    working_men = 100e6,
    participants = working_men * (participation_pct / 100),
    avg_wealth = 180000,
    wealth_per_person = avg_wealth * (wealth_dedication_pct / 100),
    total_billions = (participants * wealth_per_person) / 1e9,
    pct_gdp = (total_billions / current_giving$gdp_trillions) * 100,
    one_time = TRUE
  )

# Scenario 4: Government Spending Comparison
govt_comparison <- tibble(
  category = c("Current Charitable", "Angels 4%", "Angels 5%", 
               "US Healthcare", "US Social Security", "US Education",
               "US Defense", "US Foreign Aid", "Nordic Social Model"),
  billions = c(592.5, 1184, 1480, 4736, 1480, 1450, 1036, 71.9, 7400),
  pct_gdp = billions / 296 * 10,
  type = c("Voluntary", "Voluntary", "Voluntary",
           "Government", "Government", "Government",
           "Government", "Government", "Government")
) %>%
  mutate(category = fct_reorder(category, billions))

# ============================================================================
# PART 3: ADVANCED VISUALIZATIONS
# ============================================================================

# Graph 1: Current vs Angels Distribution
p1 <- angels_scenario %>%
  pivot_longer(cols = c(current_rate, angels_rate), 
               names_to = "scenario", values_to = "giving_rate") %>%
  ggplot(aes(x = percentile, y = giving_rate, color = scenario)) +
  geom_line(size = 1.2) +
  scale_color_manual(
    values = c("current_rate" = "#D55E00", "angels_rate" = "#009E73"),
    labels = c("Current Reality", "Angels of Man")
  ) +
  scale_y_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Distribution Shift: Angels of Man Scenario",
    subtitle = "Giving rates across income percentiles",
    x = "Income Percentile (Bottom → Top)",
    y = "Charitable Giving Rate",
    color = "Scenario"
  ) +
  theme(legend.position = "bottom")

# Graph 2: Working Men Heatmap - Income Dedication
p2 <- working_men_scenarios %>%
  ggplot(aes(x = participation_pct, y = income_dedication_pct, fill = total_billions)) +
  geom_tile() +
  geom_text(aes(label = sprintf("$%.0fB", total_billions)), 
            color = "white", size = 2.5) +
  scale_fill_viridis_c(option = "plasma", labels = dollar_format(suffix = "B")) +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  scale_y_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Working Men Income Dedication Matrix",
    subtitle = "Total annual giving by participation and dedication rates",
    x = "Participation Rate (% of 100M Working Men)",
    y = "Income Dedication Rate",
    fill = "Annual\nGiving"
  )

# Graph 3: Charitable vs Government Spending Comparison
p3 <- govt_comparison %>%
  ggplot(aes(x = billions, y = category, fill = type)) +
  geom_col() +
  geom_text(aes(label = sprintf("%.1f%%", pct_gdp)), 
            hjust = -0.1, size = 3) +
  scale_fill_manual(values = c("Voluntary" = "#E69F00", "Government" = "#0072B2")) +
  scale_x_continuous(labels = dollar_format(suffix = "B"),
                     expand = expansion(mult = c(0, 0.15))) +
  labs(
    title = "Charitable Giving vs Government Spending (USA)",
    subtitle = "Annual spending in billions (% of GDP shown)",
    x = "Total Annual Spending",
    y = NULL,
    fill = "Type"
  )

# Graph 4: International Social + Charitable Comparison
p4 <- govt_spending_full %>%
  filter(verified == TRUE) %>%
  select(country, social_spending_pct, charitable_pct, foreign_aid_pct_gni) %>%
  pivot_longer(cols = c(social_spending_pct, charitable_pct, foreign_aid_pct_gni),
               names_to = "category", values_to = "pct") %>%
  mutate(
    country = fct_reorder(country, pct, .fun = sum),
    category = factor(category,
                     levels = c("foreign_aid_pct_gni", "charitable_pct", "social_spending_pct"),
                     labels = c("Foreign Aid", "Charitable", "Social Spending"))
  ) %>%
  ggplot(aes(x = pct, y = country, fill = category)) +
  geom_col(position = "stack") +
  scale_fill_manual(values = c("Foreign Aid" = "#CC79A7",
                                "Charitable" = "#E69F00", 
                                "Social Spending" = "#0072B2")) +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Total Redistribution: Social + Charitable + Foreign Aid",
    subtitle = "Combined giving/spending as % of GDP",
    x = "Total (% of GDP)",
    y = NULL,
    fill = "Category"
  )

# Graph 5: Healthcare Spending International Comparison
p5 <- govt_spending_full %>%
  filter(!is.na(healthcare_pct)) %>%
  mutate(country = fct_reorder(country, healthcare_pct)) %>%
  ggplot(aes(x = healthcare_pct, y = country, fill = region)) +
  geom_col() +
  geom_vline(xintercept = 9.2, linetype = "dashed", color = "red", size = 0.8) +
  annotate("text", x = 9.2, y = 28, label = "OECD Avg: 9.2%", 
           hjust = -0.1, color = "red", size = 3) +
  scale_fill_brewer(palette = "Set3") +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Healthcare Spending by Country",
    subtitle = "As % of GDP",
    x = "Healthcare Spending (% GDP)",
    y = NULL,
    fill = "Region"
  )

# Graph 6: Education Spending International
p6 <- govt_spending_full %>%
  filter(!is.na(education_pct)) %>%
  mutate(country = fct_reorder(country, education_pct)) %>%
  ggplot(aes(x = education_pct, y = country, fill = region)) +
  geom_col() +
  geom_vline(xintercept = 4.9, linetype = "dashed", color = "red", size = 0.8) +
  annotate("text", x = 4.9, y = 28, label = "OECD Avg: 4.9%", 
           hjust = -0.1, color = "red", size = 3) +
  scale_fill_brewer(palette = "Set3") +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Education Spending by Country",
    subtitle = "As % of GDP",
    x = "Education Spending (% GDP)",
    y = NULL,
    fill = "Region"
  )

# Graph 7: Foreign Aid Givers (Top Donors)
p7 <- govt_spending_full %>%
  filter(!is.na(foreign_aid_billions), foreign_aid_billions > 2) %>%
  mutate(country = fct_reorder(country, foreign_aid_billions)) %>%
  ggplot(aes(x = foreign_aid_billions, y = country)) +
  geom_col(fill = "#009E73") +
  geom_text(aes(label = sprintf("%.2f%% GNI", foreign_aid_pct_gni)),
            hjust = -0.1, size = 3) +
  scale_x_continuous(labels = dollar_format(suffix = "B"),
                     expand = expansion(mult = c(0, 0.15))) +
  labs(
    title = "Top Foreign Aid Donors",
    subtitle = "Annual ODA in billions (% of GNI shown)",
    x = "Foreign Aid (Billions USD)",
    y = NULL
  )

# Graph 8: USA Foreign Aid by Sector (Pie Chart Alternative - Treemap)
p8 <- usa_foreign_aid_sectors %>%
  ggplot(aes(area = billions, fill = sector, label = paste0(sector, "\n$", 
                                                             round(billions, 1), "B\n",
                                                             round(percentage, 1), "%"))) +
  geom_treemap() +
  geom_treemap_text(color = "white", place = "centre", size = 12) +
  scale_fill_viridis_d(option = "turbo") +
  labs(
    title = "US Foreign Aid by Sector (FY2023)",
    subtitle = "Total: $71.9 billion"
  ) +
  theme(legend.position = "none")

# Graph 9: Top Aid Recipients
p9 <- top_aid_recipients %>%
  ggplot(aes(x = aid_billions, y = country, fill = primary_purpose)) +
  geom_col() +
  geom_text(aes(label = sprintf("$%.1fB", aid_billions)),
            hjust = -0.1, size = 3) +
  scale_fill_brewer(palette = "Set2") +
  scale_x_continuous(labels = dollar_format(suffix = "B"),
                     expand = expansion(mult = c(0, 0.15))) +
  labs(
    title = "Top US Foreign Aid Recipients",
    subtitle = "Annual aid in billions",
    x = "Aid Received (Billions USD)",
    y = NULL,
    fill = "Primary Purpose"
  )

# Graph 10: Public Sector Wages Comparison
p10 <- govt_spending_full %>%
  filter(!is.na(public_wages_pct)) %>%
  mutate(country = fct_reorder(country, public_wages_pct)) %>%
  ggplot(aes(x = public_wages_pct, y = country, fill = income_class)) +
  geom_col() +
  scale_fill_manual(values = c("High" = "#0072B2", 
                                "Upper-Middle" = "#56B4E9",
                                "Lower-Middle" = "#E69F00")) +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Public Sector Wage Bill by Country",
    subtitle = "Government employee salaries as % of GDP (estimated)",
    x = "Public Sector Wages (% GDP)",
    y = NULL,
    fill = "Income Class"
  )

# Graph 11: Defense Spending vs Social Spending
p11 <- govt_spending_full %>%
  filter(verified == TRUE | country %in% c("Saudi Arabia", "UAE", "Israel")) %>%
  ggplot(aes(x = defense_pct, y = social_spending_pct, 
             color = region, size = healthcare_pct)) +
  geom_point(alpha = 0.7) +
  geom_text(aes(label = country), hjust = -0.2, vjust = -0.2, size = 3) +
  scale_color_brewer(palette = "Set1") +
  scale_x_continuous(labels = percent_format(scale = 1)) +
  scale_y_continuous(labels = percent_format(scale = 1)) +
  labs(
    title = "Defense vs Social Spending",
    subtitle = "Bubble size = healthcare spending",
    x = "Defense Spending (% GDP)",
    y = "Social Spending (% GDP)",
    color = "Region",
    size = "Healthcare\n(% GDP)"
  )

# Graph 12: Total Redistribution Ranking
p12 <- govt_spending_full %>%
  filter(verified == TRUE) %>%
  mutate(country = fct_reorder(country, total_redistribution)) %>%
  ggplot(aes(x = total_redistribution, y = country)) +
  geom_col(fill = "#009E73") +
  geom_text(aes(label = sprintf("%.1f%%", total_redistribution)),
            hjust = -0.1, size = 3) +
  scale_x_continuous(labels = percent_format(scale = 1),
                     expand = expansion(mult = c(0, 0.12))) +
  labs(
    title = "Total Redistribution: Social + Charitable + Foreign Aid",
    subtitle = "Combined as % of GDP (verified countries only)",
    x = "Total Redistribution (% GDP)",
    y = NULL
  )

# Graph 13: Scenario Impact with Government Context
p13 <- bind_rows(
  govt_comparison %>% select(category, billions, type),
  tibble(
    category = c("10% Men, 20% Inc", "10% Men, 50% Inc", "10% Men, 80% Inc"),
    billions = c(130, 325, 520),
    type = "Voluntary Scenario"
  )
) %>%
  mutate(category = fct_reorder(category, billions)) %>%
  ggplot(aes(x = billions, y = category, fill = type)) +
  geom_col() +
  scale_fill_manual(values = c("Voluntary" = "#E69F00", 
                                "Government" = "#0072B2",
                                "Voluntary Scenario" = "#CC79A7")) +
  scale_x_continuous(labels = dollar_format(suffix = "B")) +
  labs(
    title = "Voluntary Scenarios in Context of Government Spending",
    subtitle = "Annual amounts in billions (USA)",
    x = "Total Annual Amount",
    y = NULL,
    fill = "Category"
  )

# ============================================================================
# PART 4: DISPLAY ALL GRAPHS
# ============================================================================

# Print all graphs
print(p1)
print(p2)
print(p3)
print(p4)
print(p5)
print(p6)
print(p7)
print(p8)
print(p9)
print(p10)
print(p11)
print(p12)
print(p13)

# Create comprehensive dashboard layouts
dashboard1 <- (p1 | p2) / (p3 | p4)
dashboard2 <- (p5 | p6) / (p7 | p8)
dashboard3 <- (p9 | p10) / (p11 | p12)

print(dashboard1)
print(dashboard2)
print(dashboard3)

# ============================================================================
# PART 5: SUMMARY STATISTICS & TABLES
# ============================================================================

cat("\n=== COMPREHENSIVE ECONOMIC ANALYSIS ===\n\n")

cat("CURRENT REALITY (USA):\n")
cat(sprintf("  Charitable Giving: $%.1fB (%.1f%% GDP)\n", 
            current_giving$total_billions, current_giving$pct_gdp))
cat(sprintf("  vs Foreign Aid: %.1fx larger\n", 
            current_giving$total_billions / 71.9))
cat(sprintf("  vs Education Spending: %.0f%% of education budget\n\n",
            (current_giving$total_billions / 1450) * 100))

cat("GOVERNMENT SPENDING CONTEXT (USA):\n")
cat(sprintf("  Healthcare: $4,736B (16.0%% GDP) - %.1fx charitable\n", 
            4736 / current_giving$total_billions))
cat(sprintf("  Social Security: $1,480B (5.0%% GDP) - %.1fx charitable\n",
            1480 / current_giving$total_billions))
cat(sprintf("  Education: $1,450B (4.9%% GDP) - %.1fx charitable\n",
            1450 / current_giving$total_billions))
cat(sprintf("  Defense: $1,036B (3.5%% GDP) - %.1fx charitable\n",
            1036 / current_giving$total_billions))
cat(sprintf("  Foreign Aid: $71.9B (0.22%% GNI) - %.1fx SMALLER than charitable\n\n",
            current_giving$total_billions / 71.9))

cat("ANGELS OF MAN SCENARIO:\n")
cat(sprintf("  Projected Total: $1,184-1,480B (4-5%% GDP)\n"))
cat(sprintf("  Would equal: %.0f-%.0f%% of education spending\n",
            (1184/1450)*100, (1480/1450)*100))
cat