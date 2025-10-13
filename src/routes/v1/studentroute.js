const express = require("express");
const app = express()
const student = require("../../controllers/studentController");
const multer = require("multer");
const path = require("path");
// const validateStudent = require("../../middleware/validateStudent");
// const upload = require("../../Utils/studentUploadFile");

const {
  validatePagination,
  validateStudent,
} = require("../../middleware/validateStudent");
const uploadexcel = require("../../middleware/excelupload");
const upload = require("../../utils/studentUploadFile");
const multerErrorHandler = require("../../utils/multerHandler");
const authenticate = require("../../middleware/admin.auth");

const studentRoute = express.Router();
const storage = multer.memoryStorage();
// const upload = multer({ storage });

// app.use((err, req, res, next) => {
//   console.log("Global Error Handler:", err);

//   if (err instanceof customError || err.statusCode) {
//     return res.status(err.statusCode || 400).json({
//       success: false,
//       message: "something went wrong",
//       error: [{ message: err.message }],
//     });
//   }
// })

studentRoute.post(
  "/uploadexcel", authenticate,
  multerErrorHandler(uploadexcel.single("file")),
  student.uploadFile
);
studentRoute.get("/sigleStudent/:id", authenticate, student.getStudent);
// studentRoute.get("/allStudents", student.getAllStudents);
studentRoute.get("/check", authenticate, student.checkDetails);
studentRoute.put("/updateStudentrt/:id", authenticate, student.updateStudentrt);

studentRoute.post(
  "/add", authenticate,
  multerErrorHandler(upload.fields([
    { name: "aadharImg", maxCount: 2 },
    { name: "pancardImg", maxCount: 2 },
    { name: "parentDocsImg", maxCount: 2 },
    { name: "profile_image", maxCount: 1 },
  ]),),

  validateStudent,
  student.addStudent
);

studentRoute.use(
  "/assets",
  express.static(path.join(__dirname, "../../assets"))
);
studentRoute.get("/inactive-students", authenticate, student.getInactiveStudents);

studentRoute.post("/upload", authenticate, multerErrorHandler(upload.single("file")), student.uploadFile);
studentRoute.post("/uploadWithoutExcel", authenticate, student.addStudent);
studentRoute.get("/students/enrollment/:enrollmentId", authenticate, student.getStudent);
studentRoute.put("/updateStudentStatus/:id", authenticate, student.updateStudentStatus);
// studentRoute.put("/updateStudentrt/:id", student.updateStudentrt);
// studentRoute.get("/allStudents", validatePagination, student.getAllStudents);
// studentRoute.put("/update", student.updateStudentController);
studentRoute.get("/export-students", authenticate, student.exportStudentsToExcel);
studentRoute.get("/allStudents", authenticate, validatePagination, student.getAllStudents);

studentRoute.put("/update/:enrollmentId", authenticate,
  multerErrorHandler(
    upload.fields([
      { name: "adhar_front_back", maxCount: 1 },
      { name: "pancard_front_back", maxCount: 1 },
      { name: "profile_image", maxCount: 1 },
    ])
  ),
  student.updateStudent);

studentRoute.get(
  "/students/course/enrollment:enrollmentId", authenticate,
  student.getStudentCourseDetails
);
studentRoute.get(
  "/student/batch-info/:studentId", authenticate,
  student.getStudentBatchDetails
);
studentRoute.get('/studentdetailscontroller', authenticate, student.studentdetailscontroller);
studentRoute.get("/certificate/:id", authenticate, student.generateCertificateByStudentId);
studentRoute.get("/batchStartEndDate/:id", authenticate, student.getCertificateDatesByStudentId);
// studentRoute.get("/batchStartEndDate/:id", student.);

studentRoute.post('/student-attendance', authenticate)


module.exports = { studentRoute };

