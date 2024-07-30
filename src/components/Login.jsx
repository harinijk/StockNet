import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Validation from "./LoginValid";
import axios from "axios";
import { useAuth } from './AuthContext';
import Dropdown from "./Dropdown";
import "./Login.css";

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordValues, setForgotPasswordValues] = useState({
    email: '',
    question: '',
    answer: '',
    newPassword: ''
  });
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUserId } = useAuth();
  const from = location.state?.from?.pathname || "/";

  // Fetch security questions for forgot password
  useEffect(() => {
    axios.get('http://localhost:3000/security-questions')
      .then(response => setQuestions(response.data))
      .catch(err => console.error('Error fetching security questions:', err));
  }, []);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setLoginMessage('');
  };

  const handleForgotPasswordInput = (value) => {
    setForgotPasswordValues(prev => ({ ...prev, question: value }));
  };

  const handleForgotPasswordChange = (event) => {
    const { name, value } = event.target;
    setForgotPasswordValues(prev => ({ ...prev, [name]: value }));
    setForgotPasswordMessage('');
  };

  const handleForgotPasswordSubmit = (event) => {
    event.preventDefault();

    axios.post('http://localhost:3000/forgot-password', forgotPasswordValues)
      .then(res => {
        setForgotPasswordMessage('Password reset successfully.');
        setShowForgotPassword(false);
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          setForgotPasswordMessage('Wrong answer to the security question or user does not exist');
        } else {
          setForgotPasswordMessage('Error resetting password. Please try again.');
        }
        console.error('Error resetting password:', err);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = Validation(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    axios
      .post('http://localhost:3000/login', values, { withCredentials: true })
      .then((res) => {
        if (res.status === 200) {
          setIsAuthenticated(true);
          setUserId(values.email);
          sessionStorage.setItem('email', values.email);
          navigate(from, { replace: true });
        }
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          setLoginMessage('Invalid credentials. Please check your email and password.');
        } else {
          console.error('Login error:', err);
          setLoginMessage('Error logging in. Please try again later.');
        }
      });
  };

  return (
    <div className="container">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Log In</h1>
          <input
            type="email"
            placeholder="Email"
            onChange={handleInput}
            name="email"
            value={values.email}
          />
          <div>{errors.email && <span className="text-danger">{errors.email}</span>}</div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleInput}
            name="password"
            value={values.password}
          />
          {errors.password && <span className="text-danger">{errors.password}</span>}
          <div className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(prev => !prev)}
            />
            <label>Show Password</label>
          </div>
          <Button
            type="submit"
            variant="contained"
            className="login-button"
            sx={{
              backgroundColor: '#50a3a2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#42918c',
              },
            }}
          >
            Log In
          </Button>
          <div>{loginMessage && <p className="login-message">{loginMessage}</p>}</div>
          <div className="forgot-password-link">
            <a href="#!" onClick={() => setShowForgotPassword(true)} className="forgot-password-text">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
      <div className="signup-container">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <Button
            className="signup-button"
            sx={{
              backgroundColor: '#50a3a2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#42918c',
              },
            }}
          >
            Sign Up
          </Button>
        </Link>
      </div>

      {/* Forgot Password Popup */}
      {showForgotPassword && (
        <div className="forgot-password-popup">
          <div className="popup-content">
            <span className="close-icon" onClick={() => setShowForgotPassword(false)}>&times;</span>
            <h2>Forgot Password</h2>
            <form onSubmit={handleForgotPasswordSubmit}>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={forgotPasswordValues.email}
                onChange={handleForgotPasswordChange}
              />
              <Dropdown
                questions={questions}
                value={forgotPasswordValues.question}
                onChange={handleForgotPasswordInput}
                
              />
              <input
                type="text"
                placeholder="Answer the question"
                name="answer"
                value={forgotPasswordValues.answer}
                onChange={handleForgotPasswordChange}
              />
              <input
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={forgotPasswordValues.newPassword}
                onChange={handleForgotPasswordChange}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#50a3a2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#42918c',
                  },
                }}
              >
                Reset Password
              </Button>
            </form>
            <div>{forgotPasswordMessage && <p className="forgot-password-message">{forgotPasswordMessage}</p>}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;