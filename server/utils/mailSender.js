import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587, // Optional: ensure you're specifying port for most SMTP servers
      secure: false, // Set true for port 465, false for other ports
      auth: {
        user: process.env.MAIL_USER, // ✅ fixed from `host` to `user`
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: "Study Notion || Codehelp by Harshit",
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error; // Optionally re-throw if you want calling code to handle it
  }
};

export default mailSender;
