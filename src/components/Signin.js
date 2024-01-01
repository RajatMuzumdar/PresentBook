import React, { useState } from "react";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const defaultTheme = createTheme();

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = { email, password };
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }
      );

      if (!response.ok) {
        throw new Error("Error signing in. Please check your credentials.");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);

      // Navigate to different pages based on the user's role
      if (data.role === "admin") {
        navigate("/admin-home-page");
      } else {
        navigate("/user-home-page");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Welcome Back!
          </Typography>
          <Typography component="h2" variant="body1">
            Please sign in to continue
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <Grid container>
              <Grid item>
                <Link href="/sign-up" variant="body2">
                  {"Don't have an account? Register Now"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
