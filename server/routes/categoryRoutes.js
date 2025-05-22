import express from "express";
import {
  categoryPageDetails,
  createCategory,
  showAllCategories,
} from "../controllers/Category.js";
import { auth, isInstructor, isStudent, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.get("/getCategoryPageDetails", categoryPageDetails);

export default router;
