import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber,
      gender,
    } = req.body;
    const id = req.user.id;

    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    });
    await user.save();

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
      updatedUserDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Cannot update profile",
      error: error.message,
    });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById({ _id: id });

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // TODO: Unenroll user from all enrolled courses
    // await Profile.findByIdAndDelete(userDetails.additionalDetails);
    // await User.findByIdAndDelete(id);

    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(userDetails.additionalDetails),
    });
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnrolled: id } },
        { new: true }
      );
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id });
    await CourseProgress.deleteMany({ userId: id });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete account",
    });
  }
};

// Get All User Details
export const getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Display Picture
export const updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );

    res.send({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Enrolled Courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await User.findOne({ _id: userId })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec();

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userId}`,
      });
    }

    const userCourses = userDetails.toObject().courses;

    for (let i = 0; i < userCourses.length; i++) {
      let totalDurationInSeconds = 0;
      let subSectionLength = 0;

      for (let j = 0; j < userCourses[i].courseContent.length; j++) {
        const subSections = userCourses[i].courseContent[j].subSection || [];

        totalDurationInSeconds += subSections.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration || "0", 10),
          0
        );

        subSectionLength += subSections.length;
      }

      userCourses[i].totalDuration = convertSecondsToDuration(
        totalDurationInSeconds
      );

      const courseProgress = await CourseProgress.findOne({
        courseID: userCourses[i]._id,
        userId: userId,
      });

      const completedVideosCount = courseProgress?.completedVideos?.length || 0;

      userCourses[i].progressPercentage =
        subSectionLength === 0
          ? 100
          : Math.round((completedVideosCount / subSectionLength) * 100 * 100) /
            100; // Round to 2 decimals
    }

    return res.status(200).json({
      success: true,
      data: userCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id });

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnrolled.length;
      const totalAmountGenerated = totalStudentsEnrolled * course.price;

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      };

      return courseDataWithStats;
    });

    res.status(200).json({ courses: courseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
