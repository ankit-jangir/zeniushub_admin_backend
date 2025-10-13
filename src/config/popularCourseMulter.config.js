const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Allowed Extensions
const allowedExtensions = ['.jpg', '.jpeg', '.png'];

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
   console.log(file);
   
  // Check both MIME type and file extension
  if (file.mimetype.startsWith('image/') && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, GIF, and WEBP images are allowed!'), false);
  }
};

// Multer Upload Config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;