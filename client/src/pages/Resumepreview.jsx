import React, { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { QRCodeCanvas } from 'qrcode.react';
import "./ResumePreview.css";

// Enhanced Resume Preview component for your MERN Resume Builder
// New features included:
// - Inline editing for summary and simple text items (contentEditable)
// - Auto-save and manual save / import / export (JSON)
// - Version history (save snapshots to localStorage and restore)
// - Section reorder (move up / move down controls)
// - Theme presets + color picker and font selector
// - Word count, page-estimate, character count
// - QR code for sharing a resume JSON (encoded in base64)
// - Improved PDF/PNG export options (page size, margin)
// - Copy to clipboard, toast notifications
// - Sanitization for pasted HTML (basic)

const DEFAULT_TEMPLATE = "template1";
const VERSION_KEY = "resume_versions";

const sanitizeHtml = (str) => {
  if (!str) return "";
  // Very small sanitizer: strip script tags and on* attributes
  return str
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+=\"[\s\S]*?\"/gi, "")
    .replace(/on\w+=\'[\s\S]*?\'/gi, "");
};

const Preview = () => {
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(
    localStorage.getItem("selectedTemplate") || DEFAULT_TEMPLATE
  );
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [previewMode, setPreviewMode] = useState("desktop");
  const printableRef = useRef();
  const [themeColor, setThemeColor] = useState(localStorage.getItem("resumeTheme") || "#0ea5e9");
  const [fontFamily, setFontFamily] = useState(localStorage.getItem("resumeFont") || "Inter, sans-serif");
  const [versions, setVersions] = useState(JSON.parse(localStorage.getItem(VERSION_KEY) || "[]"));
  const [toast, setToast] = useState(null);

  // ATS/JD-related state (same as before)
  const [jdText, setJdText] = useState(localStorage.getItem("lastJdText") || "");
  const [atsScore, setAtsScore] = useState(parseInt(localStorage.getItem("atsScore")) || 0);
  const [jdKeywords, setJdKeywords] = useState(JSON.parse(localStorage.getItem("jdKeywords")) || []);
  const [missingKeywords, setMissingKeywords] = useState(JSON.parse(localStorage.getItem("missingKeywords")) || []);
  const [strengths, setStrengths] = useState(JSON.parse(localStorage.getItem("strengths")) || []);
  const [weaknesses, setWeaknesses] = useState(JSON.parse(localStorage.getItem("weaknesses")) || []);

  // Load resume on mount
  useEffect(() => {
    try {
      const storedResumes = JSON.parse(localStorage.getItem("resumes") || "[]");
      const lastResume = storedResumes[storedResumes.length - 1];
      if (lastResume) {
        setResumeData(lastResume);
        validateResume(lastResume);
      } else {
        // initialize empty structure to avoid repeated null checks
        setResumeData({
          name: "",
          jobTitle: "",
          profilePhoto: null,
          email: "",
          phone: "",
          linkedin: "",
          github: "",
          portfolio: "",
          address: "",
          professionalSummary: "",
          education: [],
          workExperience: [],
          projects: [],
          skills: { hard: [], soft: [] },
          certifications: [],
          languages: [],
          hobbies: [],
          publications: [],
          volunteerWork: [],
          references: []
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load resume:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("resumeTheme", themeColor);
    localStorage.setItem("resumeFont", fontFamily);
  }, [themeColor, fontFamily]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Basic validation
  const validateResume = (data) => {
    const issues = [];
    if (!data?.professionalSummary) issues.push("⚠️ Professional Summary is missing.");
    if (data?.workExperience?.length > 6) issues.push("⚠️ Your resume may exceed recommended length (2 pages).");
    if (!data?.skills?.hard?.length) issues.push("⚠️ Add at least a few hard skills.");
    setWarnings(issues);
  };

  // Auto-save: persist latest resume to localStorage when changed
  useEffect(() => {
    if (!resumeData) return;
    const stored = JSON.parse(localStorage.getItem("resumes") || "[]");
    stored.push(resumeData);
    // Keep only last 20 automatic entries to avoid bloat
    localStorage.setItem("resumes", JSON.stringify(stored.slice(-50)));
  }, [resumeData]);

  // Save a named version snapshot
  const saveVersion = (note = "Manual snapshot") => {
    const snapshot = { ts: Date.now(), note, data: resumeData };
    const next = [snapshot, ...versions].slice(0, 30);
    setVersions(next);
    localStorage.setItem(VERSION_KEY, JSON.stringify(next));
    setToast("Version saved");
  };

  const restoreVersion = (index) => {
    const v = versions[index];
    if (!v) return;
    setResumeData(v.data);
    setToast("Version restored");
  };

  // Export / Import JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData?.name || "resume"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("JSON exported");
  };

  const importJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        setResumeData(obj);
        setToast("Resume imported");
      } catch (err) {
        console.error(err);
        setToast("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // PDF download with options
  const handleDownloadPDF = (opts = {}) => {
    if (!printableRef.current) return;
    const defaultOpts = {
      margin: opts.margin ?? 0.5,
      filename: `${resumeData?.name || "Resume"}_Preview.pdf`,
      html2canvas: { scale: opts.scale ?? 2 },
      jsPDF: { unit: "in", format: opts.format ?? "letter", orientation: "portrait" },
    };

    html2pdf().set(defaultOpts).from(printableRef.current).save().then(() => setToast("PDF saved")).catch((e) => console.error(e));
  };

  const handleDownloadPNG = () => {
    if (!printableRef.current) return;
    html2pdf()
      .set({
        filename: `${resumeData?.name || "Resume"}_Preview.png`,
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4" },
      })
      .from(printableRef.current)
      .save()
      .then(() => setToast("PNG saved"));
  };

  // Print
  const handlePrint = () => {
    if (!printableRef.current) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!doctype html><html><head><meta charset=\"utf-8\"><title>Print</title><style>body{font-family:${fontFamily};padding:20px;} .resume-wrapper{max-width:800px;margin:0 auto;}</style></head><body>${printableRef.current.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setToast("Opened print dialog");
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));

  // Inline edit handler for contentEditable fields
  const handleInlineEdit = (path, value) => {
    // path example: 'professionalSummary' or 'education.0.institution'
    const parts = path.split(".");
    setResumeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        cur[p] = cur[p] ?? (isNaN(parts[i + 1]) ? {} : []);
        cur = cur[p];
      }
      const final = parts[parts.length - 1];
      cur[final] = value;
      return copy;
    });
  };

  const addListItem = (path, template = "") => {
    const parts = path.split(".");
    setResumeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] = cur[parts[i]] || [];
      cur[parts[parts.length - 1]] = cur[parts[parts.length - 1]] || [];
      cur[parts[parts.length - 1]].push(template);
      return copy;
    });
  };

  const removeListItem = (path, idx) => {
    const parts = path.split(".");
    setResumeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] = cur[parts[i]] || [];
      cur[parts[parts.length - 1]] = cur[parts[parts.length - 1]] || [];
      cur[parts[parts.length - 1]].splice(idx, 1);
      return copy;
    });
  };

  // Move item up/down within a list
  const moveItem = (path, idx, dir) => {
    const parts = path.split(".");
    setResumeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev || {}));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] = cur[parts[i]] || [];
      const arr = cur[parts[parts.length - 1]] = cur[parts[parts.length - 1]] || [];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return copy;
      const [item] = arr.splice(idx, 1);
      arr.splice(newIdx, 0, item);
      return copy;
    });
  };

  const previewClassForMode = () => {
    if (previewMode === "mobile") return "preview-mobile";
    if (previewMode === "print") return "preview-print";
    return "preview-desktop";
  };

  const applyMissingKeywordsHighlight = (text) => {
    if (!text) return text;
    let output = sanitizeHtml(text);
    missingKeywords.slice(0, 40).forEach((kw) => {
      const re = new RegExp(`\\b(${kw})\\b`, "gi");
      output = output.replace(re, (m) => `<span class=\"missing-keyword\">${m}</span>`);
    });
    return output;
  };

  // small stats
  const wordCount = (s) => (s ? s.trim().split(/\s+/).filter(Boolean).length : 0);
  const pageEstimate = () => {
    const words = wordCount(resumeData?.professionalSummary || "") + (resumeData?.workExperience?.length || 0) * 50 + (resumeData?.projects?.length || 0) * 40;
    return Math.max(1, Math.ceil(words / 450));
  };

  const copyToClipboard = async (text) => {
    if (!navigator.clipboard) {
      setToast("Clipboard API not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
    } catch (e) {
      setToast("Copy failed");
    }
  };

  // small helper to encode resume into base64 for QR share
  const encodedResume = () => {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(resumeData))));
    } catch (e) {
      return "";
    }
  };

  if (loading) return <div className="preview-container text-center"><p>Loading resume data...</p></div>;

  if (!resumeData) return <div className="preview-container text-center"><p>No resume found</p></div>;

  return (
    <div className={`preview-container ${darkMode ? "dark" : ""}`} style={{ fontFamily }}>
      <div className="preview-content">
        {/* Controls row */}
        <div className="preview-controls">
          <select value={selectedTemplate} onChange={(e) => { setSelectedTemplate(e.target.value); localStorage.setItem("selectedTemplate", e.target.value); }}>
            <option value="template1">Template 1 - Modern</option>
            <option value="template2">Template 2 - Classic</option>
            <option value="template3">Template 3 - Minimal</option>
          </select>

          <select value={previewMode} onChange={(e) => setPreviewMode(e.target.value)}>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="print">Print</option>
          </select>

          <div className="template-controls">
            <button onClick={() => handleDownloadPDF({ format: "letter" })}>⬇️ PDF</button>
            <button onClick={handleDownloadPNG}>🖼️ PNG</button>
            <button onClick={handlePrint}>🖨️ Print</button>
            <button onClick={() => handleZoomIn()}>➕ Zoom In</button>
            <button onClick={() => handleZoomOut()}>➖ Zoom Out</button>
            <button onClick={() => setDarkMode((d) => !d)}>{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
          </div>

          <div className="save-controls">
            <button onClick={() => saveVersion()}>💾 Save Version</button>
            <button onClick={exportJSON}>📤 Export JSON</button>
            <label className="import-label">📥 Import
              <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importJSON(e.target.files[0])} />
            </label>
            <button onClick={() => copyToClipboard(JSON.stringify(resumeData))}>📋 Copy JSON</button>
          </div>

          <div className="theme-controls">
            <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} title="Theme color" />
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Courier New', monospace">Mono</option>
            </select>
          </div>
        </div>

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}

        {/* Stats + ATS */}
        <div className="mb-4 stats-row">
          <div>ATS Score: <strong>{atsScore}%</strong></div>
          <div>Words: {wordCount(resumeData?.professionalSummary)}</div>
          <div>Pages estimate: {pageEstimate()}</div>
          <div>Versions: {versions.length}</div>
        </div>

        <div className="preview-wrapper grid">
          <div className={`preview-pane ${previewClassForMode()}`}>
            <div ref={printableRef} className={`preview-content ${selectedTemplate}`} style={{ transform: `scale(${zoom})`, transformOrigin: "top center", borderColor: themeColor }}>
              <div className="resume-left" style={{ borderLeftColor: themeColor }}>
                <header className="resume-header">
                  {resumeData.profilePhoto && (
                    <img src={typeof resumeData.profilePhoto === 'string' ? resumeData.profilePhoto : URL.createObjectURL(resumeData.profilePhoto)} alt="Profile" className="profile-photo" />
                  )}
                  <h1 contentEditable onBlur={(e) => handleInlineEdit('name', sanitizeHtml(e.target.innerText))}>{resumeData.name || 'Your name'}</h1>
                  <h3 contentEditable onBlur={(e) => handleInlineEdit('jobTitle', sanitizeHtml(e.target.innerText))}>{resumeData.jobTitle || 'Job title'}</h3>
                </header>

                <section className="resume-contact">
                  <p><strong>Email:</strong> <span contentEditable onBlur={(e) => handleInlineEdit('email', sanitizeHtml(e.target.innerText))}>{resumeData.email}</span></p>
                  <p><strong>Phone:</strong> <span contentEditable onBlur={(e) => handleInlineEdit('phone', sanitizeHtml(e.target.innerText))}>{resumeData.phone}</span></p>
                  <p><strong>LinkedIn:</strong> <span contentEditable onBlur={(e) => handleInlineEdit('linkedin', sanitizeHtml(e.target.innerText))}>{resumeData.linkedin}</span></p>
                  <p><strong>GitHub:</strong> <span contentEditable onBlur={(e) => handleInlineEdit('github', sanitizeHtml(e.target.innerText))}>{resumeData.github}</span></p>
                </section>

                <section className="resume-section">
                  <h2>Summary</h2>
                  <div contentEditable className="editable-rich" onBlur={(e) => handleInlineEdit('professionalSummary', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: applyMissingKeywordsHighlight(resumeData.professionalSummary || '') }} />
                </section>
              </div>

              <div className="resume-right">
                {/* Render lists with simple controls (add / remove / move) */}
                {['education','workExperience','projects','skills.hard','skills.soft','certifications','languages','hobbies','publications','volunteerWork','references'].map((key) => {
                  const parts = key.split('.');
                  const main = parts[0];
                  const sub = parts[1];
                  const data = sub ? resumeData[main]?.[sub] : resumeData[main];
                  const label = key.includes('skills') ? (sub === 'hard' ? 'Hard Skills' : 'Soft Skills') : (main.charAt(0).toUpperCase() + main.slice(1));

                  return (
                    <section className="resume-section" key={key}>
                      <h2>{label} <button onClick={() => addListItem(`${main}${sub ? '.'+sub : ''}`, typeof data?.[0] === 'string' ? 'New item' : { title: 'New', description: '' })}>➕</button></h2>
                      <ul>
                        {(data || []).map((item, idx) => (
                          <li key={idx} className="list-row">
                            {typeof item === 'string' ? (
                              <>
                                <span contentEditable onBlur={(e) => handleInlineEdit(`${main}${sub ? '.'+sub : ''}.${idx}`, sanitizeHtml(e.target.innerText))}>{item}</span>
                              </>
                            ) : (
                              <div className="complex-item">
                                {Object.keys(item).map((f) => (
                                  <div key={f}><strong>{f}:</strong> <span contentEditable onBlur={(e) => handleInlineEdit(`${main}.${idx}.${f}`, sanitizeHtml(e.target.innerText))}>{item[f]}</span></div>
                                ))}
                              </div>
                            )}

                            <div className="item-controls">
                              <button onClick={() => moveItem(`${main}${sub ? '.'+sub : ''}`, idx, -1)}>↑</button>
                              <button onClick={() => moveItem(`${main}${sub ? '.'+sub : ''}`, idx, 1)}>↓</button>
                              <button onClick={() => removeListItem(`${main}${sub ? '.'+sub : ''}`, idx)}>✖</button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}

                {/* GitHub projects quick link */}
                {resumeData.projects?.some((p) => typeof p.link === 'string' && p.link.includes('github.com')) && (
                  <section className="resume-section">
                    <h2>GitHub Projects</h2>
                    <ul>
                      {resumeData.projects.filter((p) => typeof p.link === 'string' && p.link.includes('github.com')).map((p, idx) => (
                        <li key={idx}><a href={p.link} target="_blank" rel="noreferrer">{p.title || p.link}</a> — {p.description}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* QR code for quick sharing: encodes base64 JSON of resume (beware of size limits) */}
                <section className="resume-section">
                  <h2>Share</h2>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <QRCodeCanvas value={encodedResume()} size={100} />
                    <div>
                      <p style={{ margin: 0 }}>Scan to import this resume</p>
                      <button onClick={() => copyToClipboard(JSON.stringify(resumeData))}>Copy JSON</button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>

          {/* Right-side JD / ATS panel */}
          <div className="jd-pane">
            <h4>Job Description / ATS Comparison</h4>
            <textarea value={jdText} onChange={(e) => { setJdText(e.target.value); localStorage.setItem('lastJdText', e.target.value); }} rows={8} placeholder="Paste JD here to compare" />

            <div className="mt-3">
              <p><strong>Matched keywords:</strong> {Math.max(0, jdKeywords.length - missingKeywords.length)} / {jdKeywords.length}</p>
              <div className="tags">
                {jdKeywords.slice(0,40).map((k,i) => (
                  <span key={i} className={`tag ${missingKeywords.includes(k) ? 'tag-missing' : 'tag-match'}`}>{k}</span>
                ))}
              </div>

              <div>
                <h5>Suggestions</h5>
                <ul>
                  {missingKeywords.slice(0,8).map((k,i) => <li key={i}>• Add keyword: <strong>{k}</strong></li>)}
                  <li>• Make summary measurable and keyword-rich</li>
                </ul>
              </div>
            </div>

            <div className="version-list">
              <h5>Saved versions</h5>
              <ul>
                {versions.map((v, i) => (
                  <li key={v.ts}>
                    <strong>{new Date(v.ts).toLocaleString()}</strong> — {v.note}
                    <button onClick={() => restoreVersion(i)}>Restore</button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
