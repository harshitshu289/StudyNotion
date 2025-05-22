import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";

// ===== AUTH MIDDLEWARE =====
export const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers, cookies, or body
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.body?.token) {
      token = req.body.token;
    }

    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// ===== STUDENT PROTECTION =====
export const isStudent = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (userDetails.accountType !== "Student") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role verification failed",
    });
  }
};

// ===== INSTRUCTOR PROTECTION =====
export const isInstructor = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (userDetails.accountType !== "Instructor") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Instructors only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role verification failed",
    });
  }
};

// ===== ADMIN PROTECTION =====
export const isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    if (userDetails.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role verification failed",
    });
  }
};
