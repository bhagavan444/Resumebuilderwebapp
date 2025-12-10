// src/pages/Templates.jsx
import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import "./Templates.css";

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    skills: "",
  });

  const handleDownload = () => {
    const element = document.getElementById("resume-preview");
    html2pdf().from(element).save(`${formData.name}_resume.pdf`);
  };

  const templates = [
    { id: 1, name: "Modern Blue", img: "/assets/templates/Template1.jpeg" },
    { id: 2, name: "Professional Gray", img: "/assets/templates/Template2.jpeg" },
    { id: 3, name: "Creative Yellow", img: "/assets/templates/Template3.jpeg" },
  ];

  return (
    <div className="templates-wrapper">
      <h1>Select a Resume Template</h1>

      {!selectedTemplate ? (
        <div className="templates-grid">
          {templates.map((temp) => (
            <div
              key={temp.id}
              className="template-card"
              onClick={() => setSelectedTemplate(temp.id)}
            >
              <img src={temp.img} alt={temp.name} />
              <h3>{temp.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="edit-template-page">
          <h2>Edit Your Resume (Template {selectedTemplate})</h2>
          <div className="edit-template-container">
            <div className="edit-form">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <textarea
                placeholder="Education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
              <textarea
                placeholder="Experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
              <textarea
                placeholder="Skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <button onClick={handleDownload}>📄 Download as PDF</button>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{ marginTop: "10px" }}
              >
                🔙 Back to Templates
              </button>
            </div>

            <div className="preview" id="resume-preview">
              <h2>{formData.name}</h2>
              <p>📧 {formData.email}</p>
              <p>📞 {formData.phone}</p>
              <h3>🎓 Education</h3>
              <p>{formData.education}</p>
              <h3>💼 Experience</h3>
              <p>{formData.experience}</p>
              <h3>🛠️ Skills</h3>
              <p>{formData.skills}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
