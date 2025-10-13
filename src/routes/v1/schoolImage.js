const express = require("express");
const getMulterConfig = require("../../utils/file.handler");
const { schoolImage } = require("../../controllers/schoolImage");
const authenticate = require("../../middleware/admin.auth");
const multerErrorHandler = require("../../utils/multerHandler");
const schoolImageRoute = express.Router();


const imageUpload = getMulterConfig(/jpeg|jpg|png|webp|svg/);

schoolImageRoute.post("/add", authenticate, multerErrorHandler(imageUpload.single('image_path')), schoolImage.addSchoolImage);
schoolImageRoute.get("/get", authenticate, schoolImage.getAllSchoolImage);
schoolImageRoute.get("/getbyid/:id", authenticate, schoolImage.getSchoolImageById);
schoolImageRoute.patch("/update", authenticate, multerErrorHandler(imageUpload.single('image_path')), schoolImage.updateSchoolImage);
schoolImageRoute.delete("/delete/:id", authenticate, schoolImage.deleteSchoolImage);

module.exports = { schoolImageRoute }
