import React, { useState } from "react";
import Button from '@mui/material/Button';
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignUpValid";
import axios from "axios";
import Dropdown from "./Dropdown";
import "./Signup.css";

function SignUp() {
  const questions = [
    "What is your favorite color?",
    "What is your favourite city?",
    "What was the name of your first pet?",
    "What was your first car?",
    "What elementary school did you attend?"
  ];

  const [values, setValues] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    answer: '',
    question: ''  // Add this line to track the selected question
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  const handleDropdownChange = (selectedQuestion) => {
    setValues(prev => ({ ...prev, question: selectedQuestion }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = Validation(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    axios.post("http://localhost:3000/signup", values)
      .then(res => {
        navigate(`/login`);
      })
      .catch(err => console.log(err));
  }

  return (
    <div className="container">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <input type="text" placeholder="First Name" name="fname" onChange={handleInput} />
          <div>{errors.fname && <span className="text-danger">{errors.fname}</span>}</div>
          <input type="text" placeholder="Last Name" name="lname" onChange={handleInput} />
          <div>{errors.lname && <span className="text-danger">{errors.lname}</span>}</div>
          <input type="text" placeholder="Email" name="email" onChange={handleInput} />
          <div>{errors.email && <span className="text-danger">{errors.email}</span>}</div>
          <input type="password" placeholder="Password" name="password" onChange={handleInput} />
          <div>{errors.password && <span className="text-danger">{errors.password}</span>}</div>
          <div className="Dropdown">
            <Dropdown questions={questions} onChange={handleDropdownChange} />
          </div>
          <input type="text" placeholder="Answer the question" name="answer" onChange={handleInput} />
          <div>{errors.answer && <span className="text-danger">{errors.answer}</span>}</div>
          <Button variant="contained" className="signup-button" type="submit" sx={{
              backgroundColor: '#50a3a2',
              
              color: 'white',
              '&:hover': {
                backgroundColor: '#42918c',
              },
            }}>Sign Up</Button>
          <div className="login-link">
            <p className="account-text">Have an account? <Link to="/login">Log In</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;

