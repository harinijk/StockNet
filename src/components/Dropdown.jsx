import React, { useState } from 'react';

function Dropdown({ questions }) {
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const handleChange = (event) => {
    setSelectedQuestion(event.target.value);
  };

  return (
    <div className="dropdown-container">
      <select value={selectedQuestion} onChange={handleChange}>
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
