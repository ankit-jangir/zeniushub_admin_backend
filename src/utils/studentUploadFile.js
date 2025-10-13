const multer = require('multer');
const path = require('path');
const customError = require('./error.handler');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp','.pdf'];

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check both MIME type and file extension
  if (file.mimetype.startsWith('image/') && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const err = new customError('Only JPG, JPEG, PNG and WEBP images are allowed!', 400);
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
