import React, { useEffect, useState } from "react";

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const storedResumes = JSON.parse(localStorage.getItem("resumes")) || [];
    setResumes(storedResumes.reverse()); // Show latest first
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">📄 Your Created Resumes</h2>

      {resumes.length === 0 ? (
        <p className="text-center text-gray-600">No resumes created yet.</p>
      ) : (
        <div className="space-y-6">
          {resumes.map((resume, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-lg shadow-md border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                {resume.name}'s Resume
              </h3>
              <p><strong>Email:</strong> {resume.email}</p>
              <p><strong>Phone:</strong> {resume.phone}</p>
              <p><strong>Date of Birth:</strong> {resume.dob}</p>
              <p><strong>Skills:</strong> {resume.skills}</p>
              <p className="text-sm text-gray-500 mt-2">
                Created At: {new Date(resume.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeList;
