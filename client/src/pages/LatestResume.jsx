import React, { useEffect, useState } from "react";
import "../Pages/CreateResume.css"; // reuse styles if needed

const LatestResume = () => {
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLatestResume = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/resumes/latest");
        if (!response.ok) throw new Error("Failed to fetch latest resume");
        const data = await response.json();
        setResume(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLatestResume();
  }, []);

  if (error) return <p className="text-red-600 text-center mt-8">❌ {error}</p>;

  if (!resume) return <p className="text-center mt-8">⏳ Loading latest resume...</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">📄 Latest Resume</h2>
        <div className="space-y-3">
          <p><strong>👤 Name:</strong> {resume.name}</p>
          <p><strong>📧 Email:</strong> {resume.email}</p>
          <p><strong>📱 Phone:</strong> {resume.phone}</p>
          <p><strong>🎂 DOB:</strong> {resume.dob}</p>
          <p><strong>🏠 Address:</strong> {resume.address}</p>
          <p><strong>💼 Experience:</strong> {resume.experience}</p>
          <p><strong>🛠️ Skills:</strong> {resume.skills}</p>

          <Section title="🎓 Education" data={resume.education} />
          <Section title="🧪 Internships" data={resume.internships} />
          <Section title="🚀 Hackathons" data={resume.hackathons} />
          <Section title="📂 Projects" data={resume.projects} />
          <Section title="📜 Certifications" data={resume.certifications} />
          <Section title="🏅 Extra Curricular" data={resume.extraCurricular} />
          <Section title="🎯 Hobbies" data={resume.hobbies} />
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, data }) => {
  if (!data || !data.length || data.every((d) => !d)) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <ul className="list-disc list-inside text-gray-700">
        {data.map((item, index) => (
          <li key={index}>
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LatestResume;
