import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/ViewResume.css"; // if it's inside src/components/

const ViewResume = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/resume/latest");
        setResume(res.data);
      } catch (error) {
        console.error("❌ Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading your resume...</p>;
  if (!resume) return <p style={{ color: "red", textAlign: "center" }}>No resume found.</p>;

  return (
    <div className="view-resume">
      <h2>Resume Preview</h2>
      <div className="resume-card">
        <p><strong>Name:</strong> {resume.name}</p>
        <p><strong>Email:</strong> {resume.email}</p>
        <p><strong>Phone:</strong> {resume.phone}</p>
        <p><strong>DOB:</strong> {resume.dob}</p>
        <p><strong>Address:</strong> {resume.address}</p>
        <p><strong>Qualification:</strong> {resume.qualification}</p>
        <p>Skills: {Array.isArray(resume.skills) ? resume.skills.join(", ") : "No skills listed"}</p>

        <p><strong>Languages:</strong> {resume.languages?.join(", ") || "None"}</p>
        <p><strong>Experience:</strong> {resume.experience}</p>
        <p><strong>Projects:</strong> {resume.projects}</p>
        <p><strong>Certifications:</strong> {resume.certifications?.join(", ") || "None"}</p>
        <p><strong>Extra Curricular:</strong> {resume.extraCurricular?.join(", ") || "None"}</p>
        <p><strong>Hobbies:</strong> {resume.hobbies?.join(", ") || "None"}</p>
      </div>
    </div>
  );
};

export default ViewResume;
