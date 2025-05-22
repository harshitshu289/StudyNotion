import Section from "../models/Section.js";
import Course from "../models/Course.js";
import SubSection from "../models/SubSection.js";

export const createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //data validtion
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section ki object id
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    //return res
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to create section",
      error: error.message,
    });
  }
};
export const updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId, courseId } = req.body;
    //data validation
    if (!sectionName || !sectionId || courseId) {
      return res.status(400).json({
        success: true,
        message: "missing properties",
      });
    }

    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    //return res
    return res.status(200).json({
      success: true,
      message: "section updated successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to create section",
      error: error.message,
    });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }
    // Delete the associated subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    await Section.findByIdAndDelete(sectionId);

    // find the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
