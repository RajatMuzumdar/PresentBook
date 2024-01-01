import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const Summary = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/allAttendance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceData(response.data.allAttendance);
    };

    fetchAttendanceData();
  }, []);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Attendance Summary
      </Typography>
      {attendanceData.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location Verified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((attendance) => (
                <TableRow key={attendance._id}>
                  <TableCell>{attendance.name}</TableCell>
                  <TableCell>
                    {new Date(attendance.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(attendance.date).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {attendance.locationVerified ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" align="center">
          No attendance data available.
        </Typography>
      )}
    </Container>
  );
};

export default Summary;
