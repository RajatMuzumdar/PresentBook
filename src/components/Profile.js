import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch user info when the component mounts
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${process.env.REACT_APP_SERVER_URL}/me`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(response.data);
    setEditMode(false);
  };

  const handleChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mt: 3,
        }}
      >
        <Typography variant="h4" component="div">
          Profile
        </Typography>
        {user && (
          <>
            <TextField
              label="Full Name"
              variant="outlined"
              name="fullName"
              value={user.fullName}
              onChange={handleChange}
              disabled={!editMode}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Employee ID"
              variant="outlined"
              name="employeeID"
              value={user.employeeID}
              disabled
              fullWidth
              margin="normal"
            />
            {editMode ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                fullWidth
              >
                Save Changes
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                fullWidth
              >
                Edit Profile
              </Button>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}
