import express from "express";
const app = express();
import userRoutes from "./routes/User.js";
import profileRoutes from "./routes/Profile.js";
import courseRoutes from "./routes/Course.js";
import paymentRoutes from "./routes/Payments.js";
import contactUsRoute from "./routes/Contact.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import { connect } from "./config/database.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { cloudinaryConnect } from "./config/cloudinary.js";
import fileUpload from "express-fileupload";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;

// Connect to database
connect();

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://study-notion-henna.vercel.app",
];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// Cloudinary connect
cloudinaryConnect();

// Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/category", categoryRoutes);

// Default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
