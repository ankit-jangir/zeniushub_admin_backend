const express = require("express");
const { banner } = require("../../controllers/banner");
const getMulterConfig = require("../../utils/file.handler");
const authenticate = require("../../middleware/admin.auth");
const upload = require("../../config/popularCourseMulter.config");
const multerErrorHandler = require("../../utils/multerHandler");
const bannerRoute = express.Router();

// const imageUpload = getMulterConfig(/jpeg|jpg|png|webp|svg/);
// if (!imageUpload) {
//   throw new Error("Multer configuration failed to initialize.");
// }

bannerRoute.post("/add", authenticate, multerErrorHandler(upload.single('image_path')), banner.addBanner);
bannerRoute.get("/get", authenticate, banner.getAllBanner);
bannerRoute.get("/getbyid/:id", authenticate, banner.getBannerById);
bannerRoute.patch("/update", authenticate, multerErrorHandler(upload.single('image_path')), banner.updateBanner);
bannerRoute.delete("/delete/:id", authenticate, banner.deleteBanner);

module.exports = { bannerRoute }

