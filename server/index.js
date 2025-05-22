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

//database connect
connect();
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.VITE_API_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

//cloudinary connect
cloudinaryConnect();
//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
// app.use("/api/v1/category", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/category", categoryRoutes);

//default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "your server is up and running",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
