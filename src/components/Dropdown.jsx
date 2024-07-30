import React, { useState } from 'react';
import './Dropdown.css';

function Dropdown({ questions, value, onChange }) {
  const handleChange = (event) => {
    onChange(event.target.value); // Pass the selected question to the parent component
  };

  return (
    <div className="dropdown-container">
      <select value={value} onChange={handleChange} >
        <option value="" disabled>Select a question</option>
        {questions.map((question, index) => (
          <option key={index} value={question}>
            {question}
          </option>
        ))}
      </select>
    </div>
  );
}
export default Dropdown;

