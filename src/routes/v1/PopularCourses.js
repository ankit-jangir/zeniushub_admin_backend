const express = require("express");
const popularCoursesController = require("../../controllers/PopularCourses.controller");
const authenticate = require("../../middleware/admin.auth");
// const upload = require("../../config/popularCourseMulter.config");
const multer = require("multer");
const upload = require("../../utils/studentUploadFile");
const multerErrorHandler = require("../../utils/multerHandler");
const popularCourses = express.Router();


// popularCourses.post("/add-course",authenticate,imageUpload.single('image_path'), popularCoursesController.addPopularCourses);

popularCourses.post("/add-course",
    authenticate,
    (req, res, next) => {
        upload.single('image_path')(req, res, (err) => {
            if (err) {
                // Yahi pe multer error pakad lenge
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: 'File size should not exceed 5MB.' });
                }
                // Koi aur multer error
                return res.status(400).json({ message: err.message });
            }
            next();
        })
    },

    popularCoursesController.addPopularCourses);

popularCourses.get("/get-course", authenticate, popularCoursesController.getPopularCourse);
popularCourses.put("/update-course/:id", authenticate, popularCoursesController.updatePopularCourse);
popularCourses.delete("/remove-course/:id", authenticate, popularCoursesController.deletePopularCourse);
popularCourses.get("/get-course/:id", authenticate, popularCoursesController.getPopularCourseById);


module.exports = { popularCourses };