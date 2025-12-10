import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../components/SavedResumes.css";

const SavedResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/resumes") // ✅ Fetch all resumes
      .then((res) => setResumes(res.data))
      .catch((err) => console.error("❌ Failed to fetch saved resumes:", err));
  }, []);

  // ✅ Delete resume
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resumes/${id}`);
      setResumes(resumes.filter((resume) => resume._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete resume:", err);
    }
  };

  // ✅ Download as PDF
  const handleDownload = (resume) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(resume.name + " - Resume", 14, 20);
    doc.setFontSize(12);

    const resumeData = [
      ["Email", resume.email],
      ["Phone", resume.phone],
      ["DOB", resume.dob],
      ["Address", resume.address],
      ["Experience", resume.experience],
      ["Skills", resume.skills],
    ];

    doc.autoTable({
      startY: 30,
      head: [["Field", "Details"]],
      body: resumeData,
    });

    doc.save(`${resume.name}_Resume.pdf`);
  };

  // ✅ Expandable sections
  const renderArraySection = (title, data, isObject = false, limit = 2) => {
    if (!data || data.length === 0) return null;
    const [expanded, setExpanded] = useState(false);

    const itemsToShow = expanded ? data : data.slice(0, limit);

    return (
      <div className="resume-section">
        <h4>{title}</h4>
        <ul>
          {itemsToShow.map((item, idx) => (
            <li key={idx}>
              {isObject ? <pre>{JSON.stringify(item, null, 2)}</pre> : <>• {item}</>}
            </li>
          ))}
        </ul>
        {data.length > limit && (
          <button className="btn-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show Less ▲" : "Show More ▼"}
          </button>
        )}
      </div>
    );
  };

  // ✅ Search + Sort
  const filteredResumes = resumes
    .filter((resume) =>
      resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.skills.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="saved-resumes-container">
      <h1 className="title">📚 Saved Resumes</h1>

      {/* ✅ Search + Sort Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Search by name, email, or skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="newest">📅 Newest First</option>
          <option value="oldest">📅 Oldest First</option>
          <option value="name">🔠 Name (A-Z)</option>
        </select>
      </div>

      {filteredResumes.length === 0 ? (
        <p className="no-resumes">No resumes found.</p>
      ) : (
        <div className="resume-grid">
          {filteredResumes.map((resume) => (
            <div key={resume._id} className="resume-card">
              <h2>{resume.name}</h2>
              <p><strong>Email:</strong> {resume.email}</p>
              <p><strong>Phone:</strong> {resume.phone}</p>
              <p><strong>DOB:</strong> {resume.dob}</p>
              <p><strong>Address:</strong> {resume.address}</p>
              <p><strong>Experience:</strong> {resume.experience}</p>
              <p><strong>Skills:</strong> {resume.skills}</p>
              <p><strong>Created At:</strong> {new Date(resume.createdAt).toLocaleString()}</p>

              {renderArraySection("Internships", resume.internships, true)}
              {renderArraySection("Hackathons", resume.hackathons, true)}
              {renderArraySection("Projects", resume.projects)}
              {renderArraySection("Certifications", resume.certifications)}
              {renderArraySection("Education", resume.education, true)}
              {renderArraySection("Extra Curricular", resume.extraCurricular)}
              {renderArraySection("Hobbies", resume.hobbies)}

              {/* ✅ Actions */}
              <div className="resume-actions">
                <button className="btn-download" onClick={() => handleDownload(resume)}>
                  ⬇ Download PDF
                </button>
                <button className="btn-delete" onClick={() => handleDelete(resume._id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedResumes;
