const multer = require("multer");
const customError = require("../utils/error.handler");

// Use memory storage so the file is available as buffer in req.file
const storage = multer.memoryStorage();

// Allow only Excel MIME types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // sometimes older Excel or CSVs
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new customError("Only Excel (.xlsx) files are allowed"));
  }
};

const uploadExcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = uploadExcel;
