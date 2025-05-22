import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
//resetPasswordToken
export const resetPasswordToken = async (req, res) => {
  try {
    //get email from req ki body
    const email = req.body.email;
    //check user for this email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "your email is not registered",
      });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    console.log("DETAILS", updatedDetails);
    //create url
    const url = `http://localhost/3000/update-password/${token}`;
    //send email containing the url
    await mailSender(
      email,
      "Password reset link",
      `Password reset link: ${url}`
    );
    //return response
    return res.json({
      success: true,
      message: "email sent successfully please check mail and change password",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "something went wrong ",
    });
  }
};

//resetPassword
export const resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching",
      });
    }
    //get userDetails from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry -  invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "token invalid",
      });
    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "token is expired please regenerate your token",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    // return res
    return res.status(200).json({
      success: true,
      message: "password reset successfull",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong while resetting the password",
    });
  }
};
