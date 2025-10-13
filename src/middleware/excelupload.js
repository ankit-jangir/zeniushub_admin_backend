const multer = require('multer');
const customError = require('../utils/error.handler');

// Use memory storage to access req.file.buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls or .csv in some cases
    'text/csv' // for .csv
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new customError('Only Excel (.xlsx) or CSV files are allowed!'));
  }
};

const uploadexcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadexcel;
