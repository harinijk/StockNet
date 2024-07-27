import React from "react";
import CameraIcon from '@mui/icons-material/Camera';
import HomeMenu from './Menu';
import "./Header.css";
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <div className="header-container">
        <div className="icon"><CameraIcon /></div>
        <h1 className="name">Name</h1>
        <div className="header-links">
          <div className="home-link">
            <Link to="/" style={{ color: 'white' }}>Home</Link>
          </div>
          <div className="cash-link">
            <Link to="/funds" style={{ color: 'white' }}>Funds</Link>
          </div>
          <div className="buy-link">
            <Link to="/buy" style={{ color: 'white' }}>Buy</Link>
          </div>
          <div className="sell-link">
            <Link to="/sell" style={{ color: 'white' }}>Sell</Link>
          </div>
        </div>
        <div className="menu">
          <HomeMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;




