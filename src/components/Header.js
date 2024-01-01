import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOut } from './redux/auth'; // adjust the path according to your file structure

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');
    dispatch(signOut());
    // Navigate to the login page
    navigate('/');
  };

  const handleLogoClick = () => {
    // Navigate to the home page if the user is not on the sign-in or sign-up page
    if (location.pathname !== '/' && location.pathname !== '/sign-up') {
      navigate('/user-home-page');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={handleLogoClick}>
          PRESENTBOOK
        </Typography>
        {location.pathname !== '/' && location.pathname !== '/sign-up' && (
          <Button color="inherit" onClick={handleLogout}>Signout</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
