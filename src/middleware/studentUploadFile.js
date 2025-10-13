const multer = require("multer");
const path = require("path");
const fs = require("fs");
const customError = require("../utils/error.handler");

// Allowed Extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// Ensure uploads directory exists
// const uploadDir = path.join(__dirname,'..', 'assets', 'studentsDocs');

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// Storage Configuration
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, uploadDir);
  // },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// Secure File Filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check both MIME type and file extension
  if (file.mimetype.startsWith('image/') && allowedExtensions.includes(ext) || !allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new customError("Only JPG, JPEG, PNG, GIF, and WEBP images are allowed! 9999"),
      false
    );
  }
};

// Multer Upload Config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 } // 5MB limit
});

// const uploadSingleWithCustomErrors = (req, res, next) => {
//    upload.fields([
//     { name: "aadharImg", maxCount: 2 },
//     { name: "pancardImg", maxCount: 2 },
//     { name: "parentDocsImg", maxCount: 2 },
//     { name: "profile_image", maxCount: 1 },
//   ])(req, res, function (err) {
//     if (err) {
//       if (err.code === "LIMIT_FILE_SIZE") {
//         return next(new customError("File size exceeds 20MB limit", 400));
//       }
//       return next(err); // Pass other errors along
//     }
//     next();
//   });
// };


module.exports = {upload};