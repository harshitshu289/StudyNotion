import RatingAndReview from "../models/RatingAndReview.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

//createRating
export const createRating = async (req, res) => {
  try {
    //get userId
    const userId = req.user.id;

    //fetch data from req ki body
    const { rating, review, courseId } = req.body;
    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "student is not enrolled in the course",
      });
    }

    //check if user has already reviewd the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "course is already reviewed by the user",
      });
    }

    //create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update course with this rating
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    //return res
    return res.status(200).json({
      success: true,
      message: "rating and review created successfully",
      ratingReview,
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAverageRating

export const getAverageRating = async (req, res) => {
  try {
    //get courseId
    const courseId = req.body.courseId;

    //calculate avg rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(String(courseId)),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }
    //if no rating revioew exists
    return res.status(200).json({
      success: true,
      message: "average rating is 0, no ratings given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getAllRating

export const getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();
    //return res
    return res.status(200).json({
      success: true,
      message: "all reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
