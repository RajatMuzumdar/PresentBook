import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import {
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const steps = ["Start Attendance", "Face Scan", "Geofencing"];

export default function AttendancePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [attendanceStarted, setAttendanceStarted] = useState(false);
  const webcamRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [faceRecognized, setFaceRecognized] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  //for employeeID and name
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
      setUserInfo(response.data);
      console.log(response);
    };

    fetchUserInfo();
  }, []);

  //fetch user attendance date if marked
  useEffect(() => {
    const fetchAttendanceInfo = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/dataAttendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceInfo(response.data.attendanceToday);
    };

    fetchAttendanceInfo();
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  useEffect(() => {
    if (locationVerified) {
      markFinalAttendance();
    }
  }, [locationVerified]);

  const handleAttendanceStart = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const attendanceResponse = await axios.get(
      `${process.env.REACT_APP_SERVER_URL}/dataAttendance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (attendanceResponse.data.attendanceToday) {
      alert(
        `User has already marked attendance today at ${new Date(
          attendanceResponse.data.attendanceToday.time
        ).toLocaleTimeString()}`
      );
      setLoading(false);
      return;
    }

    // If not, start the attendance process
    setAttendanceStarted(true);
    setLoading(false);
    handleNext();
  };

  const handleFaceScanCapture = async () => {
    const imageData = webcamRef.current.getScreenshot();
    const byteString = atob(imageData.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const file = new File([int8Array], "face.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    const faceApiResponse = await axios.post(
      `${process.env.REACT_APP_SERVER_URL}/recognize`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Response from faceAPI:", faceApiResponse.data);
    if (faceApiResponse.data.recognized) {
      setFaceRecognized(true);
      handleNext();
    } else {
      alert("Face not recognized. Please try again.");
    }
  };

  const handleGeofencing = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const token = localStorage.getItem("token");

        const geofenceApiResponse = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/geofence`,
          { latitude, longitude },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response from geofenceAPI:", geofenceApiResponse.data);
        if (geofenceApiResponse.data.insideGeofence) {
          setLocationVerified(true);
          handleNext();
        } else {
          alert("You are not inside the geofence. Please try again.");
        }
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
  console.log(faceRecognized, locationVerified);

  const markFinalAttendance = async () => {
    if (faceRecognized) {
      const token = localStorage.getItem("token");
      try {
        const markResponse = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/markAttendance`,
          {
            userId: userInfo.userId,
            locationVerified: locationVerified,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(markResponse.data); 
      } catch (error) {
        console.error(error); 
      }
    } else {
      alert("Please complete the face scan before marking attendance.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid #000",
        borderRadius: "10px",
        padding: "20px",
        margin: "10px",
      }}
    >
      {userInfo && (
        <Typography variant="body1" component="p" gutterBottom>
          User {userInfo.fullName} with Employee ID: {userInfo.employeeID} 
        </Typography>
      )}
      {attendanceInfo ? (
        <Typography variant="body1" component="p" gutterBottom>
          You have already marked your attendance today at{" "}
          {new Date(attendanceInfo.date).toLocaleString()} thank you
        </Typography>
      ) : (
        <>
          <Typography variant="h4" component="h4" gutterBottom>
            Mark your attendance for {new Date().toLocaleString()}
          </Typography>
          <Typography variant="body1" component="p" gutterBottom>
            Please follow the steps below to mark your attendance.
          </Typography>
          {!attendanceStarted && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAttendanceStart}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                "Start Attendance Process"
              )}
            </Button>
          )}
          {attendanceStarted && (
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}
          {activeStep === 1 && faceRecognized === false && (
            <>
              <Typography variant="body1" component="p" gutterBottom>
                Step 1: Face Recognition. Please capture your face using the
                webcam.
              </Typography>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                videoConstraints={{ facingMode: "user" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleFaceScanCapture}
              >
                Face Scan
              </Button>
            </>
          )}
          {activeStep === 2 && (
            <>
              <Typography variant="body1" component="p" gutterBottom>
                Step 2: Location Verification. Please verify your location or
                proceed without location verification.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGeofencing}
              >
                Verify Location
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={markFinalAttendance}
              >
                Proceed Without Location Verification
              </Button>
            </>
          )}
          {activeStep === steps.length && faceRecognized && (
            <div>
              <Typography variant="h5" component="h2">
                Attendance Marked Successfully!
              </Typography>
              <Typography variant="body1" component="p" gutterBottom>
                Your attendance has been marked successfully.
              </Typography>
            </div>
          )}
        </>
      )}
    </div>
  );
}
