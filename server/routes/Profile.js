import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} from "../controllers/Profile.js";

import { isInstructor } from "../middlewares/auth.js";

const router = express.Router();

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount);

// Update Profile
router.put("/updateProfile", auth, updateProfile);

// Get All User Details
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

// Update Display Picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

export default router;
