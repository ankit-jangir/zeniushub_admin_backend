const customError = require('../utils/error.handler');
const { try_catch } = require('../utils/tryCatch.handler');
// const upload = require('../config/popularCourseMulter.config');
const popularCourseServices = require('../services/PopularCourses.service');
const bannerValidationSchema = require('../validators/banner.validation');
const fs = require('fs').promises;

const popularCoursesController = {

  addPopularCourses: try_catch(async (req, res) => {
    console.log(req.file, "req.file");
    // return 
    if (!req.file) {
      throw new customError("Course image is required", 400);
    }

    req.body.image_path = req.file.filename;

    const result = bannerValidationSchema.pick({ image_path: true }).safeParse(req.body);
    if (!result.success) {
      throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
    }

    await popularCourseServices.addPopularCourse(req.body, req.file);

    res.status(201).json({
      success: true,
      message: "Popular course added successfully",
      imagePath: req.body.image_path,
    });
  }),

  getPopularCourse: [
    try_catch(async (req, res) => {
      const courses = await popularCourseServices.getPopularCourse();
      return res.status(200).json({
        success: true,
        message: "Popular courses retrieved successfully",
        data: courses,
      });
    })
  ],

  getPopularCourseById: [
    try_catch(async (req, res) => {
      // console.log(req.body, "req.body");
      const courseId = req.params.id;
      const course = await popularCourseServices.getPopularCourseById(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Popular course retrieved successfully",
        data: course,
      });
    })
  ],

  updatePopularCourse: [
    // upload.single('courseImage'),
    try_catch(async (req, res) => {
      const courseId = req.params.id;
      const { courseName, courseDescription } = req.body;
      const courseImage = req.file || null;

      if (!courseName || !courseDescription) {
        return res.status(400).json({ message: "Course name and description are required" });
      }

      // Step 1: Fetch existing course
      const existingCourse = await popularCourseServices.getPopularCourseById(courseId);

      console.log("Existing course:-----------------", existingCourse);

      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Step 2: If a new image is uploaded, delete the old one
      if (courseImage && existingCourse.image) {  // <-- only if new image uploaded
        try {
          const oldImagePath = existingCourse.image;
          await fs.unlink(oldImagePath);
          console.log("Old image deleted successfully");
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }

      // Step 3: Update the course with new data and image path
      const updatedCourse = await popularCourseServices.updatePopularCourse(courseId, {
        courseName,
        courseDescription,
        imagePath: courseImage ? courseImage.path : existingCourse.imagePath, // Fix here
      });

      return res.status(200).json({
        success: true,
        message: "Popular course updated successfully",
        data: updatedCourse,
      });
    })
  ],

  // deletePopularCourse: [
  //   try_catch(async (req, res) => {
  //     const courseId = req.params.id;

  //     // 1. Fetch course by ID
  //     const course = await popularCourseServices.getPopularCourseById(courseId);

  //     console.log(course, "course_______");

  //     if (!course) {
  //       return res.status(404).json({ message: "Course not found" });
  //     }

  //     // 2. Delete associated image (if exists)
  //     if (course.image) {
  //       try {
  //         await fs.unlink(course.image);
  //         console.log("Image deleted successfully");
  //       } catch (err) {
  //         console.error("Error deleting image:", err);
  //       }
  //     }

  //     // 3. Delete course from DB
  //     await popularCourseServices.deletePopularCourse(courseId);

  //     return res.status(200).json({
  //       success: true,
  //       message: "Popular course deleted successfully",
  //     });
  //   })
  // ],

  deletePopularCourse: try_catch(async (req, res) => {
    const courseId = req.params.id;

    const result = bannerValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

    if (!result.success) {


      throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
    }

    // Fetch course by ID
    const course = await popularCourseServices.getPopularCourseById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete associated image (if exists)
    if (course.image) {
      try {
        await fs.unlink("src\\assets\\" + course.image);
        console.log("Image deleted successfully");
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    }

    // Delete course from DB    
    await popularCourseServices.deletePopularCourse(courseId);

    return res.status(200).json({
      success: true,
      message: "Popular course deleted successfully",
    });
  }),
};

module.exports = popularCoursesController;