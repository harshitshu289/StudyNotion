import Course from "../models/Course.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";
import CourseProgress from "../models/CourseProgress.js";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";

// Create a new course
export const createCourse = async (req, res) => {
  try {
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    const thumbnail = req?.files?.thumbnailImage;

    // Convert the tag and instructions from stringified Array to Array
    const tag = _tag;
    const instructions = _instructions;

    // Validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!status || status === undefined) {
      status = "Draft";
    }

    // Fetch instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    // Validate category
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Upload thumbnail image to Cloudinary
    const uploadedImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // Create new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: uploadedImage.secure_url,
      status,
      instructions,
    });

    // Add course to instructor's list
    await User.findByIdAndUpdate(
      instructorDetails._id,
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    console.log("HEREEEEEEEE", categoryDetails2);

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// Edit Course Details
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update");
      const thumbnail = req.files.thumbnailImage;
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (Object.hasOwnProperty.call(updates, key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = updates[key];
        } else {
          course[key] = updates[key];
        }
      }
    }

    await course.save();

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: 1,
        price: 1,
        thumbnail: 1,
        instructor: 1,
        ratingAndReviews: 1,
        studentsEnrolled: 1,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course data",
      error: error.message,
    });
  }
};

// Get detailed course info
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .lean();

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find the course with ID: ${courseId}`,
      });
    }

    if (courseDetails.status === "Draft") {
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      });
    }
    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      data: { courseDetails, totalDuration },
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("courseProgressCount : ", courseProgressCount);

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    if (courseDetails.status === "Draft") {
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      });
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a list of Course for a given Instructor
export const getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};
// Delete the Course
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled;
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent;
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId);
      if (section) {
        const subSections = section.subSection;
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId);
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
