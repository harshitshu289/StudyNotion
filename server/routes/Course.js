// Import the required modules
import express from "express";
const router = express.Router();

// Import the Controllers

// Course Controllers Import
import {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} from "../controllers/Course.js";

// Categories Controllers Import
import {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} from "../controllers/Category.js";

// Sections Controllers Import
import {
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/Section.js";

// Sub-Sections Controllers Import
import {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} from "../controllers/SubSection.js";

// Rating Controllers Import
import {
  createRating,
  getAverageRating,
  getAllRating,
} from "../controllers/RatingAndReview.js";
import {
  updateCourseProgress,
  getProgressPercentage,
} from "../controllers/courseProgress.js";

// Importing Middlewares
import { auth, isInstructor, isStudent, isAdmin } from "../middlewares/auth.js";

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse);
// Edit Course routes
router.post("/editCourse", auth, isInstructor, editCourse);
// Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection);
// Update a Section
router.put("/updateSection", auth, isInstructor, updateSection);
// Delete a Section
router.delete("/deleteSection", auth, isInstructor, deleteSection);
// Edit Sub Section
router.put("/updateSubSection", auth, isInstructor, updateSubSection);
// Delete Sub Section
router.get("/deleteSubSection", auth, isInstructor, deleteSubSection);
// Add a Sub Section to a Section
router.get("/addSubSection", auth, isInstructor, createSubSection);
// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses);
// Get Details for a Specific Course
router.get("/getCourseDetails", getCourseDetails);
// Get Details for a Specific Courses
router.get("/getFullCourseDetails", auth, getFullCourseDetails);
// To Update Course Progress
router.put("/updateCourseProgress", auth, isStudent, updateCourseProgress);
// To get Course Progress
router.get("/getProgressPercentage", auth, isStudent, getProgressPercentage);
// Delete a Course
router.delete("/deleteCourse", deleteCourse);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.get("/getCategoryPageDetails", categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************

router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

// Export the router using ES module syntax
export default router;
