import SubSection from "../models/SubSection.js";
import Section from "../models/Section.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

//create subSection
export const createSubSection = async (req, res) => {
  try {
    //data fetch from req ki body
    const { sectionId, title, timeDuration, description } = req.body;
    //extract files/video
    const video = req.files.videoFile;
    //validation
    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create subsection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    //update section with this subsection
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");
    //HW log updated section here after adding populate query

    //return res
    return res.status(200).json({
      success: true,
      message: " subsection created successfully",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to create subsection",
      error: error.message,
    });
  }
};
//HW update Subsucetion
export const updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );
    return res.json({
      success: true,
      data: updatedSection,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

//HW delete subsection
export const deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    return res.json({
      success: true,
      data: updatedSection,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
