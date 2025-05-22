import mongoose from "mongoose";
import mailSender from "../utils/mailSender.js";
import otpTemplate from "../mail/templates/emailVerificationTemplate.js";
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    reuired: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60 * 1000,
  },
});
// function to send emails
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification email from StudyNotion",
      otpTemplate(otp)
    );
    console.log("email sent successfully", mailResponse.response);
  } catch (error) {
    console.log("error occured while sending mail", error);
    throw error;
  }
}
otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
