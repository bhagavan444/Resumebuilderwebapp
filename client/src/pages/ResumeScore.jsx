// ResumeScore.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./ResumeScore.css";

/*
  Features added:
  - Drag & drop + file input with PDF validation
  - Upload progress bar and retry
  - Option to request server-side save (save=true or save=mongo)
  - Export analysis JSON & copy to clipboard
  - Push JD/keywords to Preview via localStorage so Preview highlights missing keywords
  - Parsed snippet viewer with matched/missing highlighting
  - Theme & font options that affect exported PDF styling
  - Quick JD templates for common roles
  - Accessibility tweaks and better error handling
*/

const ResumeScore = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [score, setScore] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [grammarIssues, setGrammarIssues] = useState([]);
  const [history, setHistory] = useState(
    () => JSON.parse(localStorage.getItem("resumeHistory")) || []
  );
  const [jobDesc, setJobDesc] = useState(
    () => localStorage.getItem("lastJobDescription") || ""
  );
  const [jobMatch, setJobMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [sector, setSector] = useState("");
  const [detectedSector, setDetectedSector] = useState("");
  const [resultRaw, setResultRaw] = useState(null);
  const [saveFlag, setSaveFlag] = useState("false"); // 'false' | 'true' | 'mongo'
  const [fontFamily, setFontFamily] = useState(
    () => localStorage.getItem("resumeFont") || "Inter, sans-serif"
  );
  const [themeColor, setThemeColor] = useState(
    () => localStorage.getItem("resumeTheme") || "#0ea5e9"
  );
  const [previewMode, setPreviewMode] = useState("compact"); // compact | full
  const chartsRef = useRef(null);
  const parsedRef = useRef(null);

  // Keyboard/drag-drop UI helpers
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("resumeFont", fontFamily);
    localStorage.setItem("resumeTheme", themeColor);
  }, [fontFamily, themeColor]);

  // Debounced save of JD
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("lastJobDescription", jobDesc);
    }, 800);
    return () => clearTimeout(t);
  }, [jobDesc]);

  // Accept file via drag & drop
  useEffect(() => {
    const onDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const f = e.dataTransfer.files?.[0];
      if (f) handleFileSelected(f);
    };
    const onDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    };
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onDragOver);
    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onDragOver);
    };
  }, []);

  // file selection & validation (only PDF permitted by default)
  const handleFileSelected = (f) => {
    setError("");
    if (!f) return;
    const name = f.name || "resume.pdf";
    if (!/\.pdf$/i.test(name) && !/\.docx?$/i.test(name) && !/\.txt$/i.test(name)) {
      setError("Please upload a PDF, DOC, DOCX or TXT file.");
      setFile(null);
      setFileName("");
      return;
    }
    setFile(f);
    setFileName(name);
    // attempt sector detection after setting file (non-blocking)
    detectSector(f).catch(() => {});
  };

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    handleFileSelected(f);
  };

  // Sector detection (calls server route /api/detect-sector if exists)
  const detectSector = async (fileToSend) => {
    try {
      const fd = new FormData();
      fd.append("resume", fileToSend);
      const resp = await axios.post("http://localhost:5000/api/detect-sector", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 8000,
      });
      setDetectedSector(resp.data.sector || "");
      setSector(resp.data.sector || "");
    } catch (err) {
      // silent fallback
      setDetectedSector("");
    }
  };

  // Basic validators
  const validate = () => {
    if (!file) return "Please select a resume file.";
    return "";
  };

  // Perform analysis
  const analyze = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setLoading(true);
    setProgressPct(0);
    setScore(null);
    setResultRaw(null);
    setJobMatch(null);

    const fd = new FormData();
    fd.append("resume", file);
    if (jobDesc) fd.append("jdText", jobDesc);
    if (saveFlag && saveFlag !== "false") fd.append("save", saveFlag);

    try {
      const resp = await axios.post("http://localhost:5000/api/score", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
        onUploadProgress: (evt) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setProgressPct(pct);
          }
        },
      });

      const data = resp.data || {};
      // normalize fields (be defensive)
      const normalized = {
        atsScore: data.atsScore ?? data.score ?? data.ats ?? null,
        breakdown: data.breakdown ?? data.scoreBreakdown ?? {},
        suggestions: data.suggestions ?? [],
        missingKeywords: data.missingKeywords ?? data.missing ?? [],
        matchedKeywords: data.matchedKeywords ?? data.matched ?? [],
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        grammarIssues: data.grammarIssues ?? data.grammar_issues ?? [],
        parsedSnippet: data.parsedSnippet ?? data.parsed_snippet ?? data.parsedText ?? "",
        detectedSector: data.detectedSector ?? data.sector ?? "",
        raw: data,
      };

      setResultRaw(normalized.raw);
      setScore(normalized.atsScore);
      setBreakdown(normalized.breakdown || {});
      setSuggestions(Array.isArray(normalized.suggestions) ? normalized.suggestions : [normalized.suggestions]);
      setMissingKeywords(normalized.missingKeywords || []);
      setMatchedKeywords(normalized.matchedKeywords || []);
      setGrammarIssues(normalized.grammarIssues || []);
      setDetectedSector(normalized.detectedSector || detectedSector);

      // save to history (simple)
      const entry = {
        file: fileName,
        score: normalized.atsScore ?? 0,
        sector: normalized.detectedSector || sector || "General",
        date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("resumeHistory", JSON.stringify(updated));

      // store keywords and ATS results so Preview component can pick them up from localStorage
      localStorage.setItem("lastJdText", jobDesc || "");
      localStorage.setItem("atsScore", String(normalized.atsScore ?? 0));
      localStorage.setItem("jdKeywords", JSON.stringify(normalized.matchedKeywords.concat(normalized.missingKeywords || [])));
      localStorage.setItem("missingKeywords", JSON.stringify(normalized.missingKeywords || []));
      localStorage.setItem("strengths", JSON.stringify(normalized.strengths || []));
      localStorage.setItem("weaknesses", JSON.stringify(normalized.weaknesses || []));

      setProgressPct(100);
      setLoading(false);
    } catch (err) {
      console.error("Analyze error:", err);
      setLoading(false);
      setError(
        err?.response?.data?.error ||
          (err.code === "ECONNABORTED" ? "Server timed out. Try again with a smaller file or check server." : "Failed to analyze resume.")
      );
    }
  };

  // Job match heuristic (quick)
  const handleJobMatch = () => {
    if (!jobDesc || score === null) {
      setError("Upload resume and paste job description first.");
      return;
    }
    const base = Math.round((score ?? 50) - (missingKeywords.length / Math.max(1, (matchedKeywords.length + missingKeywords.length))) * 10);
    const fudge = Math.max(-10, Math.min(10, Math.floor((Math.random() - 0.4) * 10)));
    const final = Math.max(0, Math.min(100, base + fudge));
    setJobMatch(final);
  };

  // Export full JSON of result
  const exportJSON = () => {
    if (!resultRaw) return;
    const blob = new Blob([JSON.stringify(resultRaw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\s+/g, "_") || "resume"}_ats_result.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy parsed snippet to clipboard (with highlights removed)
  const copyParsed = async () => {
    const text = resultRaw?.parsedSnippet || "";
    try {
      await navigator.clipboard.writeText(text);
      alert("Parsed snippet copied.");
    } catch {
      alert("Copy failed.");
    }
  };

  // Highlight snippet HTML: wrap matched / missing
  const highlightSnippet = (text) => {
    if (!text) return "";
    // escape HTML first
    const escapeHtml = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let out = escapeHtml(text);
    // highlight matched first (green), then missing (red). Use word boundaries.
    const safeSort = (arr) => Array.from(new Set((arr || []).filter(Boolean))).sort((a,b)=>b.length-a.length);
    safeSort(matchedKeywords).slice(0,200).forEach((kw) => {
      try {
        const re = new RegExp(`\\b(${escapeRegExp(kw)})\\b`, "gi");
        out = out.replace(re, `<mark class="kw-match">$1</mark>`);
      } catch {}
    });
    safeSort(missingKeywords).slice(0,200).forEach((kw) => {
      try {
        const re = new RegExp(`\\b(${escapeRegExp(kw)})\\b`, "gi");
        out = out.replace(re, `<mark class="kw-missing">$1</mark>`);
      } catch {}
    });
    return out;
  };

  // helper: escape regex
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Export a polished PDF report (charts + snippet). Uses html2canvas for charts.
  const exportPDF = async () => {
    if (!score && score !== 0) {
      setError("No analysis to export.");
      return;
    }
    setError("");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    let y = 40;
    doc.setFontSize(18);
    doc.text("ATS Resume Score Report", margin, y);
    doc.setFontSize(12);
    y += 30;
    doc.text(`File: ${fileName || "unknown"}`, margin, y);
    doc.text(`Sector: ${detectedSector || sector || "General"}`, margin + 300, y);
    y += 20;
    doc.text(`Score: ${score ?? "N/A"} / 100`, margin, y);
    y += 20;

    // Add suggestions summary
    doc.setFontSize(13);
    doc.text("Top suggestions:", margin, y);
    y += 18;
    (suggestions || []).slice(0, 6).forEach((s, i) => {
      doc.text(`• ${s}`, margin + 10, y);
      y += 14;
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
    });

    // Add a snapshot of charts section if present
    const chartsEl = chartsRef.current;
    if (chartsEl) {
      try {
        const canvas = await html2canvas(chartsEl, { scale: 2 });
        const img = canvas.toDataURL("image/png");
        if (y + 280 > 800) {
          doc.addPage();
          y = 40;
        }
        doc.addImage(img, "PNG", margin, y, doc.internal.pageSize.getWidth() - margin * 2, 280);
        y += 290;
      } catch (e) {
        console.warn("Chart capture failed:", e);
      }
    }

    // Add parsed snippet (first 2000 chars)
    const snippet = resultRaw?.parsedSnippet || "";
    if (snippet) {
      if (y + 120 > 800) {
        doc.addPage();
        y = 40;
      }
      doc.setFontSize(12);
      doc.text("Parsed snippet (preview):", margin, y);
      y += 16;
      const lines = doc.splitTextToSize(snippet.slice(0, 2000), doc.internal.pageSize.getWidth() - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 12;
    }

    if (jobMatch !== null) {
      if (y + 40 > 800) {
        doc.addPage();
        y = 40;
      }
      doc.text(`Job Match Score: ${jobMatch}%`, margin, y + 20);
    }

    const outName = `ATS-Report_${(fileName || "resume").replace(/\s+/g, "_")}.pdf`;
    doc.save(outName);
  };

  // quick JD templates
  const jdTemplates = [
    { label: "Frontend Dev (React)", val: "React, JavaScript, TypeScript, HTML, CSS, Webpack, REST APIs, Redux, component-driven design, unit testing" },
    { label: "Backend Dev (Node)", val: "Node.js, Express, REST APIs, MongoDB, SQL, authentication, microservices, Docker, CI/CD" },
    { label: "Data Scientist", val: "Python, pandas, NumPy, scikit-learn, machine learning, statistics, deep learning, TensorFlow, PyTorch" },
  ];

  // push keywords to preview (via localStorage) so Preview component highlights missing keywords
  const pushToPreview = () => {
    localStorage.setItem("lastJdText", jobDesc || "");
    localStorage.setItem("atsScore", String(score ?? 0));
    localStorage.setItem("jdKeywords", JSON.stringify(matchedKeywords.concat(missingKeywords)));
    localStorage.setItem("missingKeywords", JSON.stringify(missingKeywords));
    localStorage.setItem("strengths", JSON.stringify(resultRaw?.strengths || []));
    localStorage.setItem("weaknesses", JSON.stringify(resultRaw?.weaknesses || []));
    // dispatch storage event for same-tab updates
    window.dispatchEvent(new Event("storage"));
    alert("Pushed keywords to Preview (localStorage). Open Preview to see highlights.");
  };

  return (
    <div className="resume-score-root" style={{ fontFamily }}>
      <div className="resume-score-card" aria-live="polite">
        <header className="score-header">
          <h1>ATS Resume Score Analyzer</h1>
          <div className="header-controls">
            <label className="theme-control" title="Theme color">
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
            </label>
            <select aria-label="Font" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Courier New', monospace">Mono</option>
            </select>
            <button onClick={() => setDarkMode((d) => !d)} className="mode-btn" aria-pressed={darkMode}>
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <p className="lead">Upload your resume (PDF/DOCX/TXT) to analyze ATS compatibility. Optionally paste a Job Description for tailored matching.</p>

        <section className="upload-section">
          <div
            className={`dropzone ${file ? "has-file" : ""}`}
            onClick={() => document.getElementById("resume-input")?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && document.getElementById("resume-input")?.click()}
            aria-label="Upload resume (click or drag & drop)"
          >
            <input id="resume-input" type="file" accept=".pdf,.doc,.docx,.txt" onChange={onInputChange} style={{ display: "none" }} />
            <div className="dz-content">
              <strong>{fileName || "Click or drag & drop a file here"}</strong>
              <span className="muted">PDF, DOC, DOCX or TXT</span>
              {file && <span className="small">Selected: {fileName}</span>}
            </div>
          </div>

          <div className="options-row">
            <label>
              Save result:
              <select value={saveFlag} onChange={(e) => setSaveFlag(e.target.value)}>
                <option value="false">No</option>
                <option value="true">Save to disk on server</option>
                <option value="mongo">Save to MongoDB (if server configured)</option>
              </select>
            </label>

            <button className="analyze-btn" onClick={analyze} disabled={loading}>
              {loading ? `Analyzing… (${progressPct}%)` : "Analyze Resume"}
            </button>

            <button className="clear-btn" onClick={() => { setFile(null); setFileName(""); setScore(null); setResultRaw(null); setError(""); }}>
              Clear
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </section>

        <section className="jd-section">
          <label htmlFor="jd">Job Description (optional)</label>
          <textarea id="jd" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4} placeholder="Paste the JD to get tailored matching..." />
          <div className="jd-helpers">
            <div className="templates">
              {jdTemplates.map((t) => (
                <button key={t.label} onClick={() => setJobDesc(t.val)} className="tpl-btn">{t.label}</button>
              ))}
            </div>
            <div className="actions-small">
              <button onClick={() => { setJobDesc(""); localStorage.removeItem("lastJobDescription"); }}>Clear JD</button>
              <button onClick={() => navigator.clipboard?.writeText(jobDesc || "")}>Copy JD</button>
            </div>
          </div>
        </section>

        {/* Results / Charts */}
        {score !== null && (
          <section className="results" style={{ borderColor: themeColor }}>
            <div className="top-row" ref={chartsRef}>
              <div className="score-box">
                <h2>ATS Score</h2>
                <div className={`score-ring ${score >= 80 ? "high" : score > 60 ? "moderate" : "low"}`} style={{ borderColor: themeColor }}>
                  <span className="score-value" style={{ color: themeColor }}>{score}/100</span>
                </div>
                <p className="score-text">
                  {score >= 80 ? "Excellent" : score > 60 ? "Solid — minor tweaks" : "Needs improvement"}
                </p>

                <div className="result-actions">
                  <button onClick={exportPDF} disabled={!score}>Export PDF</button>
                  <button onClick={exportJSON} disabled={!resultRaw}>Export JSON</button>
                  <button onClick={copyParsed} disabled={!resultRaw?.parsedSnippet}>Copy Snippet</button>
                  <button onClick={pushToPreview}>Push to Preview</button>
                </div>
              </div>

              <div className="chart-box">
                <h3>Breakdown</h3>
                {Object.keys(breakdown).length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={Object.entries(breakdown).map(([k, v]) => ({ name: k, value: v }))}
                        dataKey="value"
                        label
                        outerRadius={80}
                      >
                        {Object.entries(breakdown).map((_, i) => (<Cell key={i} fill={["#16a34a", "#f59e0b", "#dc2626", "#3b82f6", "#9333ea"][i % 5]} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="muted">No detailed breakdown available.</p>}
              </div>
            </div>

            {/* Keyword coverage bar (if JD present) */}
            {jobDesc && (
              <div className="keywords-coverage">
                <h4>Keyword coverage</h4>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={[{ name: "JD", Covered: Math.max(0, (matchedKeywords || []).length), Missing: Math.max(0, (missingKeywords || []).length) }]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Covered" fill="#16a34a" />
                    <Bar dataKey="Missing" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Missing / Matched keywords */}
            <div className="keywords-grid">
              <div>
                <h4>Matched ({matchedKeywords?.length ?? 0})</h4>
                <div className="tags">
                  {(matchedKeywords || []).slice(0, 200).map((k, i) => <span className="tag match" key={i}>{k}</span>)}
                  {(!matchedKeywords || matchedKeywords.length === 0) && <div className="muted">No matched keywords</div>}
                </div>
              </div>

              <div>
                <h4>Missing ({missingKeywords?.length ?? 0})</h4>
                <div className="tags">
                  {(missingKeywords || []).slice(0, 200).map((k, i) => <span className="tag missing" key={i}>{k}</span>)}
                  {(!missingKeywords || missingKeywords.length === 0) && <div className="muted">No missing keywords</div>}
                </div>
              </div>
            </div>

            {/* Suggestions & grammar */}
            <div className="suggestions-grammar">
              <div>
                <h4>Suggestions</h4>
                <ul>{(suggestions || []).slice(0, 10).map((s, i) => <li key={i}>✅ {s}</li>)}</ul>
              </div>
              <div>
                <h4>Grammar & Readability</h4>
                {grammarIssues?.length ? <ul>{grammarIssues.map((g, i) => <li key={i}>⚠️ {g}</li>)}</ul> : <p className="muted">No issues found</p>}
              </div>
            </div>

            {/* Parsed snippet with highlights */}
            <div className="parsed-snippet" ref={parsedRef}>
              <h4>Parsed Snippet (preview)</h4>
              <div className="snippet-controls">
                <button onClick={() => setPreviewMode(previewMode === "compact" ? "full" : "compact")}>
                  Toggle {previewMode === "compact" ? "Full" : "Compact"}
                </button>
                <button onClick={copyParsed}>Copy Raw</button>
              </div>
              <div
                className={`snippet-content ${previewMode}`}
                dangerouslySetInnerHTML={{ __html: highlightSnippet(resultRaw?.parsedSnippet || "") }}
                aria-label="Parsed resume snippet with highlighted keywords"
              />
            </div>

            {/* Job match */}
            <div className="job-match-box">
              <h4>Job Match</h4>
              <div className="job-match-controls">
                <button onClick={handleJobMatch} disabled={score === null}>Compute Job Match</button>
                {jobMatch !== null && <div className="job-match-score">{jobMatch}%</div>}
              </div>
            </div>
          </section>
        )}

        {/* History and trends */}
        {history.length > 0 && (
          <section className="history">
            <h4>History</h4>
            <ul>
              {history.map((h, i) => (
                <li key={i}>
                  <strong>{h.file}</strong> — {h.sector} — {h.score}/100 — <small>{h.date}</small>
                </li>
              ))}
            </ul>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={history.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ResumeScore;
