const multer = require("multer");
const customError = require("./error.handler");

// Generic wrapper for multer with custom error handling
const multerErrorHandler = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, function (err) {
      if (err) {
        console.error("📛 Multer Middleware Error:", err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: "Multer upload error",
            error: [{ message: err.message }],
          });
        }
        // return next(~err); // Goes to your global error handler
        if (err instanceof customError || err.Statuscode) {
          return res.status(err.statusCode || 400).json({
            success: false,
            message: "something went wrong",
            error: [{ message: err.message }],
          });
        }
      }
      next();
    });
  };
};

module.exports = multerErrorHandler;
