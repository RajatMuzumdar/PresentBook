import * as React from "react";
import { useState, useRef } from "react";
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
  ThemeProvider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { LockOutlined as LockOutlinedIcon } from "@mui/icons-material";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios"; // Import axios
import { CircularProgress } from "@mui/material";

const defaultTheme = createTheme();

export default function SignUp() {
  const [isFaceScanOpen, setIsFaceScanOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const handleFaceScanClick = (event) => {
    event.preventDefault();
    setIsFaceScanOpen(true);
  };

  const handleFaceScanCapture = () => {
    const imageData = webcamRef.current.getScreenshot();
    const byteString = atob(imageData.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const file = new File([int8Array], "face.jpg", { type: "image/jpeg" });
    setCapturedImage(file);
    setIsFaceScanOpen(false);
  };

  const handleFaceScanSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData();
    data.append("fullName", event.currentTarget.fullName.value);
    data.append("employeeID", event.currentTarget.employeeID.value);
    data.append("email", event.currentTarget.email.value);
    data.append("password", event.currentTarget.password.value);
    data.append("image", capturedImage);

    try {
      setLoading(true);
      setMessage("Processing your sign-up request...");

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/signup`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.loaded < progressEvent.total) {
              setMessage("Training face recognition model...");
            }
          },
        }
      );

      setMessage("Sign-up successful! Redirecting to home page...");
      localStorage.setItem("token", response.data.token);
      navigate("/user-home-page");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : "Error signing up. Please try again.";
      setError(errorMessage);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceScanRetake = () => {
    setCapturedImage(null);
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
            Sign Up
          </Typography>
          <Box
            component="form"
            onSubmit={handleFaceScanSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="fullName"
              name="fullName"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="employeeID"
              label="employeeID"
              name="employeeID"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="email"
              name="email"
              type="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type="password"
            />
            {error && <Typography color="error">{error}</Typography>}

            <Button
              fullWidth
              variant="contained"
              onClick={handleFaceScanClick}
              sx={{ mt: 3, mb: 2 }}
            >
              Register Face
            </Button>
            {isFaceScanOpen ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={320}
                  height={240}
                  videoConstraints={{ facingMode: "user" }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleFaceScanCapture}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Capture
                </Button>
              </>
            ) : (
              capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{ width: 320, height: 240 }}
                />
              )
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>

            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2" onClick={handleFaceScanRetake}>
                  Retake FaceScan
                </Link>
              </Grid>
              <Link href="/" variant="body2">
                sign in
              </Link>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
