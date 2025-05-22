import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
    console.log("Cloudinary configured successfully.");
  } catch (error) {
    console.error("Cloudinary configuration failed:", error);
  }
};
