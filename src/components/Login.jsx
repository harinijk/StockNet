import React, { useState } from "react";
import Button from '@mui/material/Button';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Validation from "./LoginValid";
import axios from "axios";
import { useAuth } from './AuthContext';
import "./Login.css";

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginMessage, setLoginMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUserId } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setLoginMessage('');
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
          setUserId(values.email); // Use email as userId
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
          <input type="email" placeholder="Email" onChange={handleInput} name="email" />
          <div>{errors.email && <span className="text-danger">{errors.email}</span>}</div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleInput}
            name="password"
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
          <Button type="submit" variant="contained" className="login-button" sx={{
            backgroundColor: '#50a3a2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#42918c',
            },
          }}>Log In</Button>
          <div>{loginMessage && <p className="login-message">{loginMessage}</p>}</div>
          <div className="forgot-password-link"><Link to="#">Forgot Password?</Link></div>
        </form>
      </div>
      <div className="signup-container">
        <p>Don't have an account?</p>
        <Link to="/signup">
          <Button className="signup-button" sx={{
            backgroundColor: '#50a3a2',
            color: 'white',
            '&:hover': {
              backgroundColor: '#42918c',
            },
          }}>Sign Up</Button>
        </Link>
      </div>
    </div>
  );
}

export default Login;









