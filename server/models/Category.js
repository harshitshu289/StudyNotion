import mongoose from "mongoose";

// Define the category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: { type: String },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
});

// Export the category model
const Category = mongoose.model("Category", categorySchema);
export default Category;
