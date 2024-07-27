import React, { useState ,useContext} from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AuthContext  from './AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

function HomeMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate(); 
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePreferences = () => {
    handleClose(); 
    navigate('/preferences'); 
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/logout');
      sessionStorage.removeItem('email');
      setIsAuthenticated(false); 
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      handleClose();
    }
  };

  return (
    <div>
      <Button
        id="user-menu-button"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<PersonIcon style={{ fontSize: 30, color:'#F1F8E8' }} />} 
      >
      </Button>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'user-menu-button',
        }}
      >
        <MenuItem onClick={handlePreferences}>Preferences</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem> 
      </Menu>
    </div>
  );
}

export default HomeMenu;
