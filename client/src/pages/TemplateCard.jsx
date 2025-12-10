// src/components/TemplateCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./TemplateCard.css";

const TemplateCard = ({ id, imgSrc, name }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/edit-template/${id}`);
  };

  return (
    <div className="template-card" onClick={handleClick}>
      <img src={imgSrc} alt={name} />
      <h3>{name}</h3>
    </div>
  );
};

export default TemplateCard;
