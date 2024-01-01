const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userSchema.js");
const Attendance = require("../models/attendanceSchema.js");
const { trainModel } = require("../faceAPI/faceai.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { recognizeFace } = require("../faceAPI/faceai.js");
const geolib = require("geolib");

exports.createUser = async (req, res) => {
  const newUser = new User({
    fullName: req.body.fullName,
    employeeID: req.body.employeeID,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const imagePath = req.file.path;
    const label = newUser.employeeID;
    const result = await trainModel(imagePath, label);

    if (result.error) {
      return res
        .status(400)
        .json({ error: `Face recognition error: ${result.error}` });
    }

    if (result.descriptors && result.descriptors.descriptor) {
      newUser.faceDescriptor = result.descriptors;
    } else {
      return res
        .status(400)
        .json({ error: "Face recognition error: No descriptors found" });
    }

    await newUser.save();

    const token = jwt.sign(
      {
        employeeID: newUser.employeeID,
        userId: newUser._id,
        fullName: newUser.fullName,
      },
      "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A=",
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      token: token,
      expiresIn: 3600,
    });
  } catch (err) {
    return res.status(400).json({ error: `Server error: ${err.message}` });
  }
};

exports.signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the credentials match the admin credentials
    if (email === "admin@example.com" && password === "adminPassword") {
      // If they do, return a response indicating the user is an admin
      const adminToken = jwt.sign(
        {
          role: "admin",
        },
        "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A=",
        { expiresIn: "1h" }
      );
      return res
        .status(200)
        .json({ message: "Admin sign-in successful", token: adminToken });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "No such user found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        employeeID: user.employeeID,
        fullName: user.fullName,
      },
      "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A=",
      { expiresIn: "1h" }
    );
    console.log("signin done", user);
    return res.status(200).json({ message: "User sign-in successful", token });
  } catch (err) {
    console.error("Error signing in:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  const userData = jwt.verify(
    token,
    "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A="
  );

  console.log("usreData response from /me", userData);
  res.send(userData);
};

exports.updateUser = async (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  const userData = jwt.verify(
    token,
    "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A="
  );

  console.log("Request body:", req.body);

  // Find the user first
  const user = await User.findById(userData.userId);
  console.log("User:", user);

  if (user) {
    const updatedUser = await User.findByIdAndUpdate(
      userData.userId,
      { fullName: req.body.fullName },
      {
        new: true,
      }
    );

    console.log("Updated user:", updatedUser);

    res.send(updatedUser);
  } else {
    res.status(404).send({ error: "User not found" });
  }
};

exports.recognizeUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const authHeader = req.headers.authorization.split(" ");

    if (authHeader[0] !== "Bearer" || authHeader.length !== 2) {
      return res.status(401).json({ message: "Malformed token" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(
        authHeader[1],
        "1ed/BqRh+iSsyyTobkxAEsSp7kDwv2EoOGJqoHpHB4A="
      );
      req.userData = { employeeID: decodedToken.employeeID };
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const imagePath = req.file.path;
    const recognitionResult = await recognizeFace(imagePath);
    if (recognitionResult && recognitionResult.recognized) {
      if (recognitionResult.label === decodedToken.employeeID) {
        return res.status(200).json({ recognized: true });
      } else {
        return res.status(200).json({ recognized: false });
      }
    } else {
      return res.status(200).json({ recognized: false });
    }
  } catch (err) {
    console.error("Error details:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.geofence = async (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("verifing location ");
  // coordinates defined of the office by the admin
  const geofence = { latitude: 22.681036, longitude: 75.837469 };

  const insideGeofence = geolib.isPointWithinRadius(
    { latitude, longitude },
    geofence,
    1000
  );
  console.log({ insideGeofence });
  res.json({ insideGeofence });
};

exports.markAttendance = async (req, res) => {
  try {
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);

    // Check if the user has already marked attendance today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userId = req.body.userId; // Get userId from req.body

    console.log(`Checking attendance for user ${userId}...`);

    const existingAttendance = await Attendance.findOne({
      userId: userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingAttendance) {
      console.log(`User ${userId} has already marked attendance today.`);
      return res
        .status(400)
        .send({ error: "You have already marked attendance today." });
    }

    console.log(`Marking attendance for user ${userId}...`);

    const attendance = new Attendance({
      userId: userId,
      name: req.user?.fullName,
      locationVerified: req.body.locationVerified,
    });

    await attendance.save();

    console.log(`Attendance marked for user ${userId}.`);
    res.status(201).send({ attendance });
  } catch (error) {
    console.error(`Error while marking attendance for user ${userId}:`, error);
    res.status(400).send(error);
  }
};

exports.dataAttendance = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`Checking attendance for user ${req.user.userId}...`);

    const attendanceToday = await Attendance.findOne({
      userId: req.user.userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (attendanceToday) {
      console.log(
        `User ${req.user.userId} has already marked attendance today.`
      );
      res.status(200).send({ attendanceToday });
    } else {
      console.log(`User ${req.user.userId} has not marked attendance today.`);
      res.status(200).send({ attendanceToday: null });
    }
  } catch (error) {
    console.error(
      `Error while fetching attendance data for user ${req.user.userId}:`,
      error
    );
    res.status(400).send(error);
  }
};
exports.allAttendance = async (req, res) => {
  try {
    console.log("req.user:", req.user);

    console.log(
      `Fetching all attendance records for user ${req.user.userId}...`
    );

    const allAttendance = await Attendance.find({
      userId: req.user.userId,
    });

    if (allAttendance.length > 0) {
      console.log(
        `Found ${allAttendance.length} attendance records for user ${req.user.userId}.`
      );
      res.status(200).send({ allAttendance });
    } else {
      console.log(`No attendance records found for user ${req.user.userId}.`);
      res.status(200).send({ allAttendance: [] });
    }
  } catch (error) {
    console.error(
      `Error while fetching attendance data for user ${req.user.userId}:`,
      error
    );
    res.status(400).send(error);
  }
};
