const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

//user routes
router.post("/signup", userController.createUser);
router.post("/signin", userController.signInUser);
router.post("/recognize", authMiddleware, userController.recognizeUser);
router.post("/geofence", authMiddleware, userController.geofence);
router.get("/me", authMiddleware, userController.getUser);
router.post("/markAttendance", authMiddleware, userController.markAttendance);
router.get("/dataAttendance", authMiddleware, userController.dataAttendance);
router.put("/me", authMiddleware, userController.updateUser);
router.get("/allAttendance", authMiddleware, userController.allAttendance);

const adminAuthMiddleware = require("../middleware/adminauth");
// //admin routes
// router.post("/admin/signin", adminController.signInAdmin);
// router.get("/admin/data", adminAuthMiddleware, adminController.getData);
// router.put("/admin/updateUser", adminAuthMiddleware, adminController.updateUser);
// router.put("/admin/updateAttendance", adminAuthMiddleware, adminController.updateAttendance);
module.exports = router;
