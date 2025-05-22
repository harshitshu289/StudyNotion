import cloudinary from "cloudinary";

// Ensure cloudinary is configured somewhere before using this function
// e.g., cloudinary.config({ cloud_name, api_key, api_secret });

export const uploadImageToCloudinary = async (
  file,
  folder,
  height,
  quality
) => {
  const options = { folder };

  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  options.resource_type = "video"; // ✅ fixed typo

  return await cloudinary.uploader.upload(file.tempFilePath, options); // ✅ moved inside function
};
