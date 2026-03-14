// ─── ESG COPILOT — APP.JS ───
// QA engine, tab switching, file upload, memo export

// ─── STATE ───
let currentIssues = [];
let currentDataset = [];
let currentMeta = {};

// ─── RISK TAG LABELS ───
const RISK_LABELS = {
  audit: "Audit risk",
  comparability: "Comparability",
  completeness: "Completeness"
};
const RISK_CLASSES = {
  audit: "risk-audit",
  comparability: "risk-comparability",
  completeness: "risk-completeness"
};

// ─── QA ENGINE ───
function runQA(rows) {
  const allIssues = [];
  QA_RULES.forEach(rule => {
    try {
      const found = rule.check(rows);
      found.forEach(issue => {
        allIssues.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          name: rule.name,
          riskType: rule.riskType || null,
          whyMatters: rule.whyMatters || null,
          suggestedFix: rule.suggestedFix || null,
          disclosureNote: rule.disclosureNote || null,
          ...issue
        });
      });
    } catch(e) {
      console.warn("Rule error:", rule.id, e);
    }
  });
  return allIssues;
}

// ─── SEVERITY ORDER ───
const SEV_ORDER = { high: 0, medium: 1, low: 2 };

function sortIssues(issues) {
  return issues.slice().sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
}

// ─── BUILD ISSUE CARD HTML ───
function buildIssueCard(issue, showAdvisory = false) {
  const sevClass = `sev-${issue.severity}`;
  const sevLabel = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
  const riskTag = issue.riskType
    ? `<span class="risk-tag ${RISK_CLASSES[issue.riskType]}">${RISK_LABELS[issue.riskType]}</span>` : "";

  const hasAdvisory = showAdvisory && (issue.whyMatters || issue.suggestedFix || issue.disclosureNote);

  let advisoryHtml = "";
  if (hasAdvisory) {
    advisoryHtml = `
      <div class="advisory-grid">
        ${issue.whyMatters ? `<div class="adv-block"><div class="adv-label">Why it matters</div><div class="adv-text">${issue.whyMatters}</div></div>` : ""}
        ${issue.suggestedFix ? `<div class="adv-block"><div class="adv-label">Suggested fix</div><div class="adv-text">${issue.suggestedFix}</div></div>` : ""}
        ${issue.disclosureNote ? `<div class="adv-block"><div class="adv-label">Disclosure implication</div><div class="adv-text">${issue.disclosureNote}</div></div>` : ""}
      </div>`;
  }

  return `
    <div class="issue-card">
      <div class="issue-header ${hasAdvisory ? 'has-advisory' : ''}">
        <span class="sev-badge ${sevClass}">${sevLabel}</span>
        <div class="issue-body">
          <div class="issue-title">${issue.name}</div>
          <div class="issue-location">${issue.year ? `${issue.year} · ` : ""}${issue.field || ""} · ${issue.detail}</div>
        </div>
        <div class="risk-tags">${riskTag}</div>
      </div>
      ${advisoryHtml}
    </div>`;
}

// ─── RENDER RESULTS ───
function renderResults(issues, meta) {
  currentIssues = sortIssues(issues);
  currentMeta = meta;

  const high = currentIssues.filter(i => i.severity === "high");
  const medium = currentIssues.filter(i => i.severity === "medium");
  const low = currentIssues.filter(i => i.severity === "low");

  // Update metrics
  document.getElementById("metTotal").textContent = currentIssues.length;
  document.getElementById("metHigh").textContent = high.length;
  document.getElementById("metMedium").textContent = medium.length;
  document.getElementById("metLow").textContent = low.length;
  document.getElementById("tabCountAll").textContent = currentIssues.length;
  document.getElementById("tabCountHigh").textContent = high.length;
  document.getElementById("tabCountMedium").textContent = medium.length;
  document.getElementById("tabCountLow").textContent = low.length;

  // Status
  const statusDot = document.getElementById("statusDot");
  const statusLabel = document.getElementById("statusLabel");
  statusDot.className = "status-dot";
  if (high.length > 0) {
    statusDot.classList.add("dot-red");
    statusLabel.textContent = "Not ready for disclosure";
    document.querySelector(".exec-summary").style.borderLeftColor = "#E24B4A";
  } else if (medium.length > 0) {
    statusDot.classList.add("dot-amber");
    statusLabel.textContent = "Conditionally ready — review required";
    document.querySelector(".exec-summary").style.borderLeftColor = "#EF9F27";
  } else {
    statusDot.classList.add("dot-green");
    statusLabel.textContent = "Ready for disclosure";
    document.querySelector(".exec-summary").style.borderLeftColor = "#1D9E75";
  }
  document.getElementById("statusSub").textContent =
    `${meta.company} · ${meta.file} · ${meta.indicators} indicators · ${meta.years} years`;

  // Executive summary
  const execText = buildExecSummary(currentIssues, meta);
  document.getElementById("execText").textContent = execText;

  // Build tab panels
  document.getElementById("tab-all").innerHTML = currentIssues.map(i => buildIssueCard(i, false)).join("") || "<p style='color:var(--text-3);font-size:13px;padding:16px;'>No issues detected.</p>";
  document.getElementById("tab-high").innerHTML = high.map(i => buildIssueCard(i, true)).join("") || "<p style='color:var(--text-3);font-size:13px;padding:16px;'>No high severity issues.</p>";
  document.getElementById("tab-medium").innerHTML = medium.map(i => buildIssueCard(i, true)).join("") || "<p style='color:var(--text-3);font-size:13px;padding:16px;'>No medium severity issues.</p>";
  document.getElementById("tab-low").innerHTML = low.map(i => buildIssueCard(i, false)).join("") || "<p style='color:var(--text-3);font-size:13px;padding:16px;'>No low severity issues.</p>";

  // Advisory tab
  const advisoryIssues = currentIssues.filter(i => i.whyMatters && (i.severity === "high" || i.severity === "medium"));
  document.getElementById("advisoryContent").innerHTML = advisoryIssues.map(i => buildIssueCard(i, true)).join("") || "<p style='color:var(--text-3);font-size:13px;padding:16px;'>No advisory notes available.</p>";

  // Memo tab
  document.getElementById("memoContent").innerHTML = buildMemo(currentIssues, meta);

  // Show results
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");
  showTab("all");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── EXEC SUMMARY TEXT ───
function buildExecSummary(issues, meta) {
  const high = issues.filter(i => i.severity === "high").length;
  const medium = issues.filter(i => i.severity === "medium").length;
  const low = issues.filter(i => i.severity === "low").length;

  if (issues.length === 0) {
    return `No data quality issues detected in ${meta.company}'s ${meta.file}. The dataset appears consistent and may be suitable for external ESG disclosure. A final human review is recommended before submission.`;
  }

  const riskNames = [...new Set(issues.filter(i => i.severity === "high").slice(0,3).map(i => i.name.toLowerCase()))];
  const riskStr = riskNames.length > 0 ? `Critical concerns include: ${riskNames.join(", ")}.` : "";
  return `${issues.length} data issue${issues.length > 1 ? "s" : ""} detected across ${meta.company}'s ${meta.file} (${high} high, ${medium} medium, ${low} low severity). ${riskStr} The dataset requires correction before it is suitable for external ESG disclosure under GRI, IFRS S2, or GHG Protocol standards.`;
}

// ─── BUILD MEMO HTML ───
function buildMemo(issues, meta) {
  const today = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const high = issues.filter(i => i.severity === "high");
  const medium = issues.filter(i => i.severity === "medium");
  const low = issues.filter(i => i.severity === "low");
  const readiness = high.length > 0 ? '<span class="memo-status-bad">NOT READY FOR DISCLOSURE</span>' : medium.length > 0 ? '<span style="color:#BA7517;font-weight:500;">CONDITIONALLY READY — REVIEW REQUIRED</span>' : '<span class="memo-status-ok">READY FOR DISCLOSURE</span>';

  const renderList = (arr) => arr.map((i, idx) => `${idx+1}. ${i.name} — ${i.year || ""} (${i.detail})`).join("\n");
  const renderNextSteps = () => {
    const steps = [...new Set(issues.filter(i => i.suggestedFix).map(i => i.suggestedFix))];
    return steps.slice(0, 8).map((s, i) => `${i+1}. ${s}`).join("\n");
  };

  return `
    <h2>ESG Data QA Review Memo</h2>
    <hr>
    <p class="memo-meta">
      <strong>Dataset:</strong> ${meta.company} — ${meta.file}<br>
      <strong>Reporting period:</strong> ${meta.period || "Multiple years"}<br>
      <strong>Review date:</strong> ${today}<br>
      <strong>Prepared by:</strong> ESG Copilot · esgcopilot.site<br>
      <strong>Contact:</strong> info@esgcopilot.site
    </p>
    <hr>
    <h3>Disclosure readiness</h3>
    <p>${readiness}</p>
    <p style="margin-top:8px;font-size:12px;">${buildExecSummary(issues, meta)}</p>
    ${high.length > 0 ? `<hr><h3>High severity issues (${high.length})</h3><pre style="white-space:pre-wrap;font-size:11px;">${renderList(high)}</pre>` : ""}
    ${medium.length > 0 ? `<hr><h3>Medium severity issues (${medium.length})</h3><pre style="white-space:pre-wrap;font-size:11px;">${renderList(medium)}</pre>` : ""}
    ${low.length > 0 ? `<hr><h3>Low severity issues (${low.length})</h3><pre style="white-space:pre-wrap;font-size:11px;">${renderList(low)}</pre>` : ""}
    ${issues.some(i => i.riskType === "audit") ? `<hr><h3>Primary disclosure risks</h3><pre style="white-space:pre-wrap;font-size:11px;">${issues.filter(i=>i.riskType).map(i=>`— ${i.name} (${RISK_LABELS[i.riskType]})`).join("\n")}</pre>` : ""}
    ${issues.some(i => i.suggestedFix) ? `<hr><h3>Recommended next steps</h3><pre style="white-space:pre-wrap;font-size:11px;">${renderNextSteps()}</pre>` : ""}
    <div class="memo-footer">Generated by ESG Copilot · info@esgcopilot.site · esgcopilot.site</div>`;
}

// ─── EXPORT MEMO AS TXT ───
function exportMemo() {
  if (!currentMeta.company) return;
  showTab("memo");
  const memo = document.getElementById("memoContent");
  const text = memo.innerText || memo.textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ESG-QA-Review-Memo-${currentMeta.company.replace(/\s+/g,"-")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── TAB SWITCHING ───
function showTab(name) {
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const panel = document.getElementById("tab-" + name);
  if (panel) panel.classList.remove("hidden");
  const btn = document.querySelector(`.tab[data-tab="${name}"]`);
  if (btn) btn.classList.add("active");
}

// ─── PARSE CSV ───
function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g,""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g,""));
    const obj = {};
    headers.forEach((h, i) => {
      const v = vals[i];
      obj[h] = (v === "" || v === null || v === undefined) ? null : isNaN(v) ? v : parseFloat(v);
    });
    return obj;
  });
}

// ─── LOAD SAMPLE DATASET ───
function loadSample() {
  const years = [...new Set(SAMPLE_DATA.map(r => r.Year))].sort();
  const meta = {
    company: "GreenCo Ltd",
    file: "ESG Dataset 2021–2024",
    period: `${years[0]}–${years[years.length-1]}`,
    indicators: "30",
    years: years.length
  };
  const issues = runQA(SAMPLE_DATA);
  renderResults(issues, meta);
}

// ─── FILE UPLOAD ───
function handleFile(file) {
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "csv") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        const years = [...new Set(rows.map(r => r.Year))].sort();
        const company = rows[0]?.Company || file.name.replace(/\.[^.]+$/,"");
        const meta = {
          company,
          file: file.name,
          period: years.length ? `${years[0]}–${years[years.length-1]}` : "—",
          indicators: Object.keys(rows[0] || {}).length.toString(),
          years: years.length
        };
        const issues = runQA(rows);
        renderResults(issues, meta);
      } catch(err) {
        alert("Could not parse CSV. Please ensure your file uses standard CSV formatting with column headers.");
      }
    };
    reader.readAsText(file);
  } else {
    alert("Currently supports CSV files. XLSX support coming soon. You can save your Excel file as CSV and re-upload.");
  }
}

// ─── EVENT LISTENERS ───
document.addEventListener("DOMContentLoaded", () => {
  // Sample button
  const sampleBtn = document.getElementById("sampleBtn");
  if (sampleBtn) sampleBtn.addEventListener("click", (e) => { e.stopPropagation(); loadSample(); });

  // Upload zone click
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("fileInput");
  if (uploadZone && fileInput) {
    uploadZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
    // Drag & drop
    uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.style.background = "rgba(29,158,117,0.1)"; });
    uploadZone.addEventListener("dragleave", () => { uploadZone.style.background = ""; });
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault(); uploadZone.style.background = "";
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
  }

  // Tabs
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });

  // Export button
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) exportBtn.addEventListener("click", exportMemo);

  // Back button
  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.addEventListener("click", () => {
    document.getElementById("results").classList.add("hidden");
    document.getElementById("landing").classList.remove("hidden");
    window.scrollTo({ top: 0 });
  });
});
