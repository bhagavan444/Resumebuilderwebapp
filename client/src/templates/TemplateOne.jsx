import React from 'react';

const TemplateOne = ({ data }) => {
  return (
    <div style={{ fontFamily: 'Arial', padding: 20 }}>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
      <p>Phone: {data.phone}</p>
      <h2>Education</h2>
      {data.education.map((edu, index) => (
        <div key={index}>
          <p>{edu.degree} - {edu.institution}</p>
          <p>{edu.year}</p>
        </div>
      ))}
      <h2>Skills</h2>
      <ul>
        {data.skills.map((skill, i) => <li key={i}>{skill}</li>)}
      </ul>
      <h2>Projects</h2>
      {data.projects.map((project, i) => (
        <div key={i}>
          <p><strong>{project.title}</strong>: {project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default TemplateOne;
