import {
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Typography,
  Box,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

const drawerWidth = 240;
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-end",
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  // eslint-disable-next-line
  const [userInfo, setUserInfo] = useState(null);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    // Fetch user info when the component mounts
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data);
      console.log(response);
      console.log(response.data);
      console.log(response.data.fullName)
    };

    fetchUserInfo();
  }, []);

  return (
    <div>
      <CssBaseline />
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{ mr: 2, ...(open && { display: "none" }) }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <List>
          {[
            { text: "Mark Attendance", link: "/attendance" },
            { text: "Profile Page", link: "/profile" },
            { text: "Attendance Summary", link: "/summary" },
          ].map((item, index) => (
            <ListItem button key={item.text} component={Link} to={item.link}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="div" gutterBottom>
          Welcome to PresentBook 
        </Typography>
        <Typography variant="body1" gutterBottom>
          PresentBook: Face Recognition Attendance System for Remote Workers is a comprehensive solution designed to streamline the process of attendance management for remote workers. It is a MERN stack application that integrates facial recognition technology and geolocation services to provide a robust and reliable attendance system. The system allows users to sign up, sign in, and mark their attendance by capturing their image and verifying their location. This ensures that the attendance marked is authentic and the employee is within the predefined area.
        </Typography>
        <Typography variant="body1">
          Get started by selecting an option from the menu on the left. Enjoy your experience with PresentBook!
        </Typography>
      </Box>
    </div>
  );
}
