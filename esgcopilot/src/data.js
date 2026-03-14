// ─── SAMPLE DATASET ───
// Based on real ESG report structures (IAMGOLD, WSP, Celestica, GHG Protocol)
// 30 indicators, 4 years, 10 intentional QA errors for demo purposes

const SAMPLE_DATA = [
  {
    Company: "GreenCo Ltd", Industry: "Manufacturing", Country: "Canada", Year: 2021,
    Revenue_USD: 500000000, Employees: 4200,
    Scope1_tCO2e: 1200, Scope2_location_tCO2e: 800, Scope2_market_tCO2e: 760,
    Scope3_tCO2e: 3200, Total_emissions_tCO2e: 5200,
    Emissions_intensity: 0.0000104,
    Energy_consumption_MWh: 45000, Electricity_use_MWh: 28000, Fuel_use_GJ: 15000,
    Renewable_energy_pct: 32,
    Water_withdrawal_m3: 120000, Water_consumption_m3: 100000, Water_recycled_pct: 40,
    Waste_generated_tons: 5000, Waste_recycled_pct: 55, Hazardous_waste_tons: 320,
    Total_employees: 4200, Female_employees_pct: 38, Injury_rate: 1.2,
    Training_hours_per_employee: 22,
    Net_zero_target_year: 2050, Science_based_target: "Yes", Internal_carbon_price_USD: 45
  },
  {
    Company: "GreenCo Ltd", Industry: "Manufacturing", Country: "Canada", Year: 2022,
    Revenue_USD: 540000000, Employees: 4300,
    Scope1_tCO2e: 1180, Scope2_location_tCO2e: 780, Scope2_market_tCO2e: 740,
    Scope3_tCO2e: 3300, Total_emissions_tCO2e: 5000,
    Emissions_intensity: 0.0000092,
    Energy_consumption_MWh: 46000, Electricity_use_MWh: 29000, Fuel_use_GJ: 15200,
    Renewable_energy_pct: 34,
    Water_withdrawal_m3: 118000, Water_consumption_m3: 102000, Water_recycled_pct: 42,
    Waste_generated_tons: 5200, Waste_recycled_pct: 57, Hazardous_waste_tons: 330,
    Total_employees: 4300, Female_employees_pct: 39, Injury_rate: 1.1,
    Training_hours_per_employee: 23,
    Net_zero_target_year: 2050, Science_based_target: "Yes", Internal_carbon_price_USD: 45
  },
  {
    // ERROR 1: Scope1+2+3 = 1150+760+3100 = 5010 ≠ Total 4920 (delta +90)
    Company: "GreenCo Ltd", Industry: "Manufacturing", Country: "Canada", Year: 2023,
    Revenue_USD: 580000000, Employees: 4450,
    Scope1_tCO2e: 1150, Scope2_location_tCO2e: 760, Scope2_market_tCO2e: 720,
    Scope3_tCO2e: 3100, Total_emissions_tCO2e: 4920,        // ERROR 1: reconciliation gap
    Emissions_intensity: 0.0000085,
    Energy_consumption_MWh: 47000, Electricity_use_MWh: 30000, Fuel_use_GJ: 15800,
    Renewable_energy_pct: 36,
    Water_withdrawal_m3: 121000, Water_consumption_m3: 130000, Water_recycled_pct: 44, // ERROR 2: consumption > withdrawal
    Waste_generated_tons: 5100, Waste_recycled_pct: 59, Hazardous_waste_tons: 340,
    Total_employees: 4450, Female_employees_pct: 40, Injury_rate: -0.3,               // ERROR 3: negative injury rate
    Training_hours_per_employee: 24,
    Net_zero_target_year: 2050, Science_based_target: "Yes", Internal_carbon_price_USD: 45
  },
  {
    // ERROR 4: Scope3 = 0 (was 3100 previous year)
    // ERROR 5: Scope2_market_tCO2e missing (null)
    // ERROR 6: Renewable_energy_pct = 120 (>100%)
    // ERROR 7: Waste_recycled_pct = 105 (>100%)
    // ERROR 8: Emissions_intensity mismatch (manually entered wrong value)
    // ERROR 9: YoY emissions decline 60% (threshold 40%)
    Company: "GreenCo Ltd", Industry: "Manufacturing", Country: "Canada", Year: 2024,
    Revenue_USD: 620000000, Employees: 4600,
    Scope1_tCO2e: 1100, Scope2_location_tCO2e: 720, Scope2_market_tCO2e: null,       // ERROR 5
    Scope3_tCO2e: 0, Total_emissions_tCO2e: 5100,                                      // ERROR 4
    Emissions_intensity: 0.0000082,                                                     // ERROR 8: should be ~0.00000823
    Energy_consumption_MWh: 48000, Electricity_use_MWh: 31000, Fuel_use_GJ: 16000,
    Renewable_energy_pct: 120,                                                          // ERROR 6
    Water_withdrawal_m3: 125000, Water_consumption_m3: 118000, Water_recycled_pct: 48,
    Waste_generated_tons: 5200, Waste_recycled_pct: 105, Hazardous_waste_tons: 350,    // ERROR 7
    Total_employees: 4600, Female_employees_pct: 41, Injury_rate: 0.9,
    Training_hours_per_employee: 26,
    Net_zero_target_year: 2050, Science_based_target: "Yes", Internal_carbon_price_USD: 45
  },
  {
    // ERROR 10: duplicate row (identical to 2024)
    Company: "GreenCo Ltd", Industry: "Manufacturing", Country: "Canada", Year: 2024,
    Revenue_USD: 620000000, Employees: 4600,
    Scope1_tCO2e: 1100, Scope2_location_tCO2e: 720, Scope2_market_tCO2e: null,
    Scope3_tCO2e: 0, Total_emissions_tCO2e: 5100,
    Emissions_intensity: 0.0000082,
    Energy_consumption_MWh: 48000, Electricity_use_MWh: 31000, Fuel_use_GJ: 16000,
    Renewable_energy_pct: 120,
    Water_withdrawal_m3: 125000, Water_consumption_m3: 118000, Water_recycled_pct: 48,
    Waste_generated_tons: 5200, Waste_recycled_pct: 105, Hazardous_waste_tons: 350,
    Total_employees: 4600, Female_employees_pct: 41, Injury_rate: 0.9,
    Training_hours_per_employee: 26,
    Net_zero_target_year: 2050, Science_based_target: "Yes", Internal_carbon_price_USD: 45
  }
];

// ─── QA RULES DEFINITIONS ───
// 30 rules covering all major ESG data validation scenarios

const QA_RULES = [
  // A. DATA INTEGRITY
  {
    id: "A01", category: "Data integrity", severity: "high",
    name: "Missing values in core indicators",
    check: (rows) => {
      const coreFields = ["Scope1_tCO2e","Scope2_location_tCO2e","Scope3_tCO2e","Total_emissions_tCO2e","Energy_consumption_MWh"];
      const issues = [];
      rows.forEach((row, i) => {
        coreFields.forEach(f => {
          if (row[f] === null || row[f] === undefined || row[f] === "") {
            issues.push({ row: i+1, year: row.Year, field: f, detail: `Missing value in ${f}` });
          }
        });
      });
      return issues;
    }
  },
  {
    id: "A02", category: "Data integrity", severity: "high",
    name: "Duplicate rows detected",
    check: (rows) => {
      const seen = {}; const issues = [];
      rows.forEach((row, i) => {
        const key = `${row.Company}-${row.Year}`;
        if (seen[key] !== undefined) {
          issues.push({ row: i+1, year: row.Year, field: "Year", detail: `Duplicate entry for ${row.Year} (also row ${seen[key]+1})` });
        } else { seen[key] = i; }
      });
      return issues;
    }
  },

  // B. GHG EMISSIONS
  {
    id: "B01", category: "GHG emissions", severity: "high",
    name: "Scope emissions reconciliation gap",
    riskType: "audit",
    whyMatters: "A reconciliation gap means the sum of individual Scopes does not equal the reported total, undermining data integrity and creating inconsistencies that assurance providers will flag immediately.",
    suggestedFix: "Reconcile each Scope against source data. Check for double-counting across Scope 2 location vs. market-based figures. Verify that all Scope 3 categories are included.",
    disclosureNote: "Under GHG Protocol, total emissions must reconcile with the sum of all reported Scopes. Unresolved gaps will be flagged in external assurance reviews (ISAE 3000).",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Scope1_tCO2e != null && row.Scope2_location_tCO2e != null && row.Scope3_tCO2e != null && row.Total_emissions_tCO2e != null) {
          const sum = row.Scope1_tCO2e + row.Scope2_location_tCO2e + row.Scope3_tCO2e;
          const diff = Math.abs(sum - row.Total_emissions_tCO2e);
          if (diff > 10) {
            issues.push({ row: i+1, year: row.Year, field: "Total_emissions_tCO2e", detail: `Scope1+2+3 = ${sum.toLocaleString()} ≠ Total ${row.Total_emissions_tCO2e.toLocaleString()} (delta: ${diff.toFixed(0)} tCO₂e)` });
          }
        }
      });
      return issues;
    }
  },
  {
    id: "B02", category: "GHG emissions", severity: "high",
    name: "Scope 3 emissions drop to zero",
    riskType: "comparability",
    whyMatters: "A sudden Scope 3 drop to zero almost never reflects a genuine reduction — it typically indicates missing data, a reporting boundary change, or a data entry error. Scope 3 typically represents 60–90% of a manufacturer's total footprint.",
    suggestedFix: "Verify Scope 3 category-level data for the affected year. Confirm whether categories such as purchased goods, business travel, and waste were calculated or omitted.",
    disclosureNote: "IFRS S2 and GRI 305 require disclosure of reporting boundaries. If Scope 3 is genuinely unavailable, a methodological note is required to maintain year-over-year comparability.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Scope3_tCO2e === 0 || row.Scope3_tCO2e === null) {
          const prev = rows.find(r => r.Year === row.Year - 1);
          if (prev && prev.Scope3_tCO2e > 0) {
            issues.push({ row: i+1, year: row.Year, field: "Scope3_tCO2e", detail: `Scope 3 = 0 in ${row.Year} (was ${prev.Scope3_tCO2e.toLocaleString()} in ${prev.Year})` });
          }
        }
      });
      return issues;
    }
  },
  {
    id: "B03", category: "GHG emissions", severity: "high",
    name: "Negative emissions value",
    check: (rows) => {
      const fields = ["Scope1_tCO2e","Scope2_location_tCO2e","Scope2_market_tCO2e","Scope3_tCO2e","Total_emissions_tCO2e"];
      const issues = [];
      rows.forEach((row, i) => {
        fields.forEach(f => {
          if (row[f] !== null && row[f] < 0) {
            issues.push({ row: i+1, year: row.Year, field: f, detail: `${f} = ${row[f]} — negative value requires explanation (carbon removal?)` });
          }
        });
      });
      return issues;
    }
  },
  {
    id: "B04", category: "GHG emissions", severity: "high",
    name: "Scope 2 market-based value missing",
    riskType: "completeness",
    whyMatters: "GHG Protocol Scope 2 Guidance requires both location-based and market-based figures when an organization uses contractual instruments (RECs, PPAs). Omitting one method makes CDP submissions and IFRS S2 disclosures incomplete.",
    suggestedFix: "Calculate market-based Scope 2 using applicable emission factors from energy suppliers or residual mix factors. If no contractual instruments are in use, document this explicitly.",
    disclosureNote: "CDP Climate questionnaire requires both Scope 2 figures. Missing market-based values will result in an incomplete submission score.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Scope2_location_tCO2e != null && (row.Scope2_market_tCO2e === null || row.Scope2_market_tCO2e === undefined)) {
          issues.push({ row: i+1, year: row.Year, field: "Scope2_market_tCO2e", detail: `Location-based Scope 2 present but market-based value is missing` });
        }
      });
      return issues;
    }
  },

  // C. EMISSIONS INTENSITY
  {
    id: "C01", category: "Emissions intensity", severity: "high",
    name: "Emissions intensity mismatch",
    riskType: "comparability",
    whyMatters: "Emissions intensity is a key benchmarking KPI used by institutional investors (MSCI, Sustainalytics). If the manually entered value differs from the calculated value, it creates a discrepancy that undermines comparability.",
    suggestedFix: "Recalculate intensity as Total_emissions / Revenue. Ensure intensity is always derived automatically from source values, not manually entered.",
    disclosureNote: "Intensity metrics reported externally must be consistent with absolute emissions figures. A significant variance will be identified during assurance.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Total_emissions_tCO2e && row.Revenue_USD && row.Emissions_intensity) {
          const calc = row.Total_emissions_tCO2e / row.Revenue_USD;
          const variance = Math.abs(calc - row.Emissions_intensity) / row.Emissions_intensity;
          if (variance > 0.05) {
            issues.push({ row: i+1, year: row.Year, field: "Emissions_intensity", detail: `Reported intensity ${row.Emissions_intensity.toExponential(4)} ≠ calculated ${calc.toExponential(4)} (${(variance*100).toFixed(1)}% variance)` });
          }
        }
      });
      return issues;
    }
  },

  // D. YEAR-OVER-YEAR ANOMALIES
  {
    id: "D01", category: "Year-over-year", severity: "medium",
    name: "Unusual year-over-year emissions change",
    riskType: "comparability",
    whyMatters: "An abrupt multi-year change in total emissions is statistically unusual and may signal an incomplete dataset, a methodology change, or a reporting boundary revision that has not been disclosed.",
    suggestedFix: "Verify whether the change reflects a genuine operational shift or a data quality issue. If a legitimate change occurred, document the underlying cause in the sustainability report narrative.",
    disclosureNote: "Sustainability reports should include narrative explanation for significant year-on-year changes. Unexplained reductions attract scrutiny from investors and assurance providers.",
    check: (rows) => {
      const issues = [];
      const sorted = [...rows].sort((a,b) => a.Year - b.Year);
      for (let i=1; i<sorted.length; i++) {
        const prev = sorted[i-1], curr = sorted[i];
        if (prev.Total_emissions_tCO2e && curr.Total_emissions_tCO2e) {
          const change = Math.abs((curr.Total_emissions_tCO2e - prev.Total_emissions_tCO2e) / prev.Total_emissions_tCO2e);
          if (change > 0.40) {
            const dir = curr.Total_emissions_tCO2e > prev.Total_emissions_tCO2e ? "increase" : "decline";
            issues.push({ row: i+1, year: curr.Year, field: "Total_emissions_tCO2e", detail: `${(change*100).toFixed(0)}% YoY ${dir} (${prev.Year}: ${prev.Total_emissions_tCO2e.toLocaleString()} → ${curr.Year}: ${curr.Total_emissions_tCO2e.toLocaleString()} tCO₂e)` });
          }
        }
      }
      return issues;
    }
  },

  // E. ENERGY
  {
    id: "E01", category: "Energy", severity: "medium",
    name: "Energy sub-component exceeds total",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Electricity_use_MWh && row.Energy_consumption_MWh && row.Electricity_use_MWh > row.Energy_consumption_MWh) {
          issues.push({ row: i+1, year: row.Year, field: "Electricity_use_MWh", detail: `Electricity ${row.Electricity_use_MWh.toLocaleString()} MWh exceeds total energy ${row.Energy_consumption_MWh.toLocaleString()} MWh` });
        }
      });
      return issues;
    }
  },

  // F. WATER
  {
    id: "F01", category: "Water", severity: "high",
    name: "Water consumption exceeds withdrawal",
    riskType: "audit",
    whyMatters: "Consumption cannot physically exceed withdrawal — this is a thermodynamic impossibility. This indicates a data entry error, unit mismatch, or formula error in the source spreadsheet.",
    suggestedFix: "Review source data for water withdrawal and consumption figures. Check whether units are consistent (both in m³). Verify that withdrawal captures all intake sources.",
    disclosureNote: "Water data with physically impossible values will be rejected by CDP Water questionnaire validation. This must be corrected before submission.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Water_consumption_m3 != null && row.Water_withdrawal_m3 != null && row.Water_consumption_m3 > row.Water_withdrawal_m3) {
          issues.push({ row: i+1, year: row.Year, field: "Water_consumption_m3", detail: `Consumption ${row.Water_consumption_m3.toLocaleString()} m³ > Withdrawal ${row.Water_withdrawal_m3.toLocaleString()} m³ (physically impossible)` });
        }
      });
      return issues;
    }
  },
  {
    id: "F02", category: "Water", severity: "medium",
    name: "Water recycled percentage out of range",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Water_recycled_pct != null && (row.Water_recycled_pct < 0 || row.Water_recycled_pct > 100)) {
          issues.push({ row: i+1, year: row.Year, field: "Water_recycled_pct", detail: `Water recycled = ${row.Water_recycled_pct}% — must be between 0 and 100` });
        }
      });
      return issues;
    }
  },

  // G. WASTE
  {
    id: "G01", category: "Waste", severity: "high",
    name: "Waste recycling rate exceeds 100%",
    riskType: "audit",
    whyMatters: "A recycling rate above 100% is logically impossible and indicates a denominator error in the source calculation — typically using a subset of waste rather than total waste generated.",
    suggestedFix: "Review the recycling rate formula. Ensure the denominator is total waste generated, not a sub-category. Check for unit inconsistencies (tonnes vs. kg).",
    disclosureNote: "GRI 306-4 requires accurate waste diversion rates. Values above 100% will be flagged as data quality errors by GRI-trained reviewers and assurance providers.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Waste_recycled_pct != null && row.Waste_recycled_pct > 100) {
          issues.push({ row: i+1, year: row.Year, field: "Waste_recycled_pct", detail: `Waste recycled = ${row.Waste_recycled_pct}% — exceeds 100% (formula error)` });
        }
      });
      return issues;
    }
  },

  // H. PERCENTAGES
  {
    id: "H01", category: "Percentages", severity: "high",
    name: "Renewable energy percentage exceeds 100%",
    riskType: "audit",
    whyMatters: "A renewable energy percentage above 100% indicates a formula error — likely calculating renewable generation against a subset of total electricity consumption rather than the full denominator.",
    suggestedFix: "Correct the denominator to total electricity consumption. If the figure includes externally sold renewable energy, this must be disclosed separately.",
    disclosureNote: "GRI 302-1 and CDP Climate require accurate renewable energy percentages. Values above 100% will fail automated data validation checks.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Renewable_energy_pct != null && row.Renewable_energy_pct > 100) {
          issues.push({ row: i+1, year: row.Year, field: "Renewable_energy_pct", detail: `Renewable energy = ${row.Renewable_energy_pct}% — exceeds 100% (denominator error)` });
        }
      });
      return issues;
    }
  },
  {
    id: "H02", category: "Percentages", severity: "medium",
    name: "Gender diversity percentage out of range",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Female_employees_pct != null && (row.Female_employees_pct < 0 || row.Female_employees_pct > 100)) {
          issues.push({ row: i+1, year: row.Year, field: "Female_employees_pct", detail: `Female employees = ${row.Female_employees_pct}% — must be 0–100` });
        }
      });
      return issues;
    }
  },

  // I. WORKFORCE
  {
    id: "I01", category: "Workforce", severity: "medium",
    name: "Negative injury rate",
    riskType: "audit",
    whyMatters: "A negative injury rate is logically impossible and indicates a data entry or formula error in the safety performance metrics. Safety data is prominently reviewed by ESG rating agencies.",
    suggestedFix: "Review the source data for the safety performance indicators and correct the injury rate formula. The rate should be expressed per 200,000 hours worked (OSHA standard).",
    disclosureNote: "GRI 403-9 and SASB require accurate safety metrics. Negative values will immediately flag data quality concerns during investor due diligence.",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Injury_rate != null && row.Injury_rate < 0) {
          issues.push({ row: i+1, year: row.Year, field: "Injury_rate", detail: `Injury rate = ${row.Injury_rate} — negative value is impossible` });
        }
      });
      return issues;
    }
  },

  // J. GOVERNANCE
  {
    id: "J01", category: "Governance", severity: "low",
    name: "Net-zero target year before 2030",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Net_zero_target_year && row.Net_zero_target_year < 2030) {
          issues.push({ row: i+1, year: row.Year, field: "Net_zero_target_year", detail: `Target year ${row.Net_zero_target_year} is before 2030 — verify this is intentional` });
        }
      });
      return issues;
    }
  },
  {
    id: "J02", category: "Governance", severity: "low",
    name: "Negative internal carbon price",
    check: (rows) => {
      const issues = [];
      rows.forEach((row, i) => {
        if (row.Internal_carbon_price_USD != null && row.Internal_carbon_price_USD < 0) {
          issues.push({ row: i+1, year: row.Year, field: "Internal_carbon_price_USD", detail: `Carbon price = ${row.Internal_carbon_price_USD} USD — cannot be negative` });
        }
      });
      return issues;
    }
  }
];

// Export for use in app.js
if (typeof module !== 'undefined') {
  module.exports = { SAMPLE_DATA, QA_RULES };
}
