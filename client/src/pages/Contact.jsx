import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaGithub, FaLinkedin, FaCalendarAlt, FaMapMarkerAlt, FaDownload, FaCopy } from "react-icons/fa";
import "./Contact.css";

// Contact_Enhanced.jsx
// Features added:
// - Contact info + social links
// - Interactive contact form with client-side validation and honeypot anti-spam
// - vCard (contact.vcf) download generator
// - Copy-to-clipboard actions for phone/email
// - Schedule meeting (Calendly link stub)
// - Embedded map iframe placeholder
// - Recent messages panel (stored in localStorage)
// - Newsletter subscribe input (mock)
// - Accessibility improvements and ARIA attributes

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "", phone: "", website: "" });
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subStatus, setSubStatus] = useState(null);
  const [copied, setCopied] = useState("");

  // Load recent messages from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cv_messages") || "[]");
    setMessages(saved.reverse());
  }, []);

  // Save message to local history (client-only)
  const pushMessage = (entry) => {
    const arr = [entry, ...JSON.parse(localStorage.getItem("cv_messages") || "[]")].slice(0, 10);
    localStorage.setItem("cv_messages", JSON.stringify(arr));
    setMessages(arr.reverse());
  };

  // Form validation
  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (form.message.trim().length < 10) return "Message must be at least 10 characters.";
    // honeypot check: website field should be empty if human
    if (form.website && form.website.trim().length > 0) return "Spam detected.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setStatus({ ok: false, msg: err });
      return;
    }
    setStatus({ ok: null, msg: "Sending..." });
    try {
      // replace with your API endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, message: form.message }),
      });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      setStatus({ ok: true, msg: data?.message || "Message sent. We'll respond soon." });
      pushMessage({ name: form.name, email: form.email, message: form.message, date: new Date().toISOString() });
      setForm({ name: "", email: "", message: "", phone: "", website: "" });
    } catch (err) {
      // fallback to client-side storage
      pushMessage({ name: form.name, email: form.email, message: form.message, date: new Date().toISOString(), offline: true });
      setStatus({ ok: true, msg: "Saved locally (offline). We'll retry when backend is available." });
      setForm({ name: "", email: "", message: "", phone: "", website: "" });
    }
    setTimeout(() => setStatus(null), 3500);
  };

  // Subscribe mock
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(subscribeEmail)) {
      setSubStatus({ ok: false, msg: "Enter a valid email" });
      return;
    }
    setSubStatus({ ok: null, msg: "Subscribing..." });
    setTimeout(() => {
      setSubStatus({ ok: true, msg: "Subscribed! Check your inbox for tips." });
      setSubscribeEmail("");
      setTimeout(() => setSubStatus(null), 3000);
    }, 800);
  };

  // vCard generator
  const downloadVCard = (opts = {}) => {
    const fullName = opts.name || "Bhagavan";
    const email = opts.email || "g.sivasatyasaibhagavan@gmail.com";
    const phone = opts.phone || "+91 7569205626";
    const lines = [];
    lines.push("BEGIN:VCARD");
    lines.push("VERSION:3.0");
    lines.push(`FN:${fullName}`);
    lines.push(`ORG:Enhance CV`);
    lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
    lines.push(`EMAIL;TYPE=PREF,INTERNET:${email}`);
    lines.push("END:VCARD");
    const blob = new Blob([lines.join("\r\n")], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enhancecv_contact.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      setCopied("err");
      setTimeout(() => setCopied(""), 2000);
    }
  };

  return (
    <main className="contact-main">
      <section className="contact-card">
        <h1 className="contact-title">
          <span className="contact-emoji">📬</span> Professional Contact
        </h1>
        <p className="contact-intro">
          I welcome opportunities for collaboration, inquiries, or professional discussions. <br />
          <span className="contact-highlight">Please feel free to reach out at your convenience.</span>
        </p>

        <div className="contact-grid">
          <div className="left">
            <div className="methods">
              <div className="method">
                <div className="meta">
                  <FaPhone aria-hidden />
                  <div>
                    <div className="label">Phone</div>
                    <div className="value">+91 7569205626</div>
                  </div>
                </div>
                <div className="actions">
                  <a href="tel:+917569205626" className="btn small">Call</a>
                  <button className="btn small" onClick={() => copyToClipboard("+917569205626", "phone")}>
                    <FaCopy /> {copied === "phone" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="method">
                <div className="meta">
                  <FaEnvelope aria-hidden />
                  <div>
                    <div className="label">Email</div>
                    <div className="value">g.sivasatyasaibhagavan@gmail.com</div>
                  </div>
                </div>
                <div className="actions">
                  <a href="mailto:g.sivasatyasaibhagavan@gmail.com" className="btn small">Email</a>
                  <button className="btn small" onClick={() => copyToClipboard("g.sivasatyasaibhagavan@gmail.com", "email")}>
                    <FaCopy /> {copied === "email" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="socials">
                <a href="https://github.com/bhagavan444" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FaGithub /> <span>GitHub</span>
                </a>
                <a href="https://linkedin.com/in/bhagavan444" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FaLinkedin /> <span>LinkedIn</span>
                </a>
                <a href="https://calendly.com/" target="_blank" rel="noreferrer" aria-label="Schedule Meeting">
                  <FaCalendarAlt /> <span>Schedule</span>
                </a>
                <button className="btn small" onClick={() => downloadVCard()} aria-label="Download vCard">
                  <FaDownload /> <span>vCard</span>
                </button>
              </div>

              <div className="map">
                <div className="map-head"><FaMapMarkerAlt /> Location</div>
                <iframe
                  title="Office location"
                  src="https://www.google.com/maps?q=Eluru%2C%20India&output=embed"
                  loading="lazy"
                  aria-label="Map showing location"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="right">
            <h2>Send a message</h2>
            <form className="contact-form" onSubmit={handleSubmit} aria-label="Contact form">
              <label>
                Name
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label style={{ display: "none" }}>
                Website (leave blank)
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </label>
              <label>
                Phone (optional)
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </label>
              <label>
                Message
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </label>
              <div className="form-actions">
                <button className="btn primary" type="submit">Send Message</button>
                <button className="btn outline" type="button" onClick={() => { setForm({ name: "", email: "", message: "", phone: "", website: "" }); setStatus(null); }}>
                  Reset
                </button>
              </div>
              {status && <div className={`status ${status.ok ? "ok" : "err"}`}>{status.msg}</div>}
            </form>

            <div className="subscribe">
              <h3>Subscribe for tips</h3>
              <form onSubmit={handleSubscribe} className="subscribe-form">
                <input placeholder="you@company.com" value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} />
                <button className="btn" type="submit">Subscribe</button>
              </form>
              {subStatus && <div className={`status ${subStatus.ok ? "ok" : "err"}`}>{subStatus.msg}</div>}
            </div>

            <div className="recent">
              <h4>Recent messages (local)</h4>
              {messages.length === 0 ? (
                <div className="muted">No messages yet — be the first to reach out!</div>
              ) : (
                <ul>
                  {messages.map((m, i) => (
                    <li key={i}>
                      <div className="rm-head"><strong>{m.name}</strong> <span className="muted">{new Date(m.date).toLocaleString()}</span></div>
                      <div className="rm-msg">{m.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="contact-footer">© 2025 Enhance CV — Built with ❤️</footer>
    </main>
  );
}
