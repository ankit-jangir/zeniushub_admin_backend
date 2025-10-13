const multer = require('multer');
const customError = require('../utils/error.handler');

// Use memory storage for accessing file buffer directly
const storage = multer.memoryStorage();

// Allow only Excel and CSV files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls or sometimes .csv
    'text/csv', // .csv in some browsers
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new customError('Only Excel (.xlsx) or CSV files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max size: 5MB
});

module.exports = upload;
