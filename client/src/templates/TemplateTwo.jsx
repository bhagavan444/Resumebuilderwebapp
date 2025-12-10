import React from 'react';

const TemplateTwo = ({ data }) => {
  return (
    <div style={{ fontFamily: 'Georgia', padding: 20, backgroundColor: '#f4f4f4' }}>
      <h1 style={{ color: '#333' }}>{data.name}</h1>
      <p><strong>Email:</strong> {data.email}</p>
      <p><strong>Phone:</strong> {data.phone}</p>

      <section>
        <h2>Education</h2>
        {data.education.map((edu, i) => (
          <div key={i}>
            <p>{edu.institution} - {edu.degree} ({edu.year})</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Technical Skills</h2>
        <p>{data.skills.join(', ')}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i}>
            <p><strong>{exp.company}</strong>: {exp.role} ({exp.duration})</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default TemplateTwo;
