import { instance } from "../config/razorpay.js";
import { courseEnrollmentEmail } from "../mail/templates/courseEnrollmentEmail.js";
import { paymentSuccessEmail } from "../mail/templates/paymentSuccessEmail.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import crypto from "crypto";
import mongoose from "mongoose";

//capture the payment and initiate the razorpay order
export const capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      // Find the course by its ID
      course = await Course.findById(course_id);

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(String(userId));
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      // Add the price of the course to the total amount
      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

//verify signature of razorpay and server

export const verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;

  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }

  return res.status(400).json({ success: false, message: "Payment Failed" });
};

const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "please provide data for Courses or UserId",
    });
  }
  for (const courseId of courses) {
    try {
      //find the course and enroll the student
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "course not found",
        });
      }
      //finmd the student and add the course
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );
      //send mail
      const emailResponse = await mailSender(
        enrollStudents.email,
        `sucessfully ennrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName}`
        )
      );
      // console.log("Email sent successfully", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};
export const sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || userId) {
    return res.status(400).json({
      success: false,
      message: "please provide all the fields",
    });
  }
  try {
    //student ko dhundho
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res.status(500).json({
      success: false,
      message: "couldnot send email",
    });
  }
};
