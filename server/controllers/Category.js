import Category from "../models/Category.js";
import mongoose from "mongoose";

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const categoryDetails = await Category.create({ name, description });

    console.log("Created category:", categoryDetails);

    return res.status(200).json({
      success: true,
      message: "Category created successfully",
      data: categoryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Show all categories
export const showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: 1, description: 1 }
    ).lean();

    return res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get details for a category page
export const categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Get selected category and its courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // Get courses from other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    const differentCourses = categoriesExceptSelected.flatMap(
      (cat) => cat.courses
    );

    // Get top-selling courses across all categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((cat) => cat.courses);

    const mostSellingCourses = allCourses
      .filter((course) => typeof course.sold === "number")
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      selectedCourses,
      differentCourses,
      mostSellingCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
