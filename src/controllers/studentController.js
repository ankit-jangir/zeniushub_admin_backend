const fs = require("fs");
// const studentService = require("../services/studentService");
const XLSX = require("xlsx");
const { v4: uuidv4 } = require("uuid"); // For UUID generation
const { Student } = require("../models/");
const { try_catch } = require("../utils/tryCatch.handler");
const customError = require("../utils/error.handler");
const studentService = require("../services/studentService");
const path = require("path");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { uploadFileToAzure, getBlob } = require("../utils/azureUploader");
const { StatusCodes } = require("http-status-codes");
const { file } = require("pdfkit");
const batchesRepositorie = new batchesRepositories();
// const studentRepository = new studentRepositories();
const coursesRepository = new CoursesRepositories();
const {
  certificateRepositories,
} = require("../repositories/certifiacateStudent");
const cetificateRepositorie = new certificateRepositories();

const student = {
  addStudent: try_catch(async (req, res) => {
    // console.log("Request body:", req.body);

    const studentData = req.body;
    
    console.log("studentData : :", studentData);

    const blobFolder = `studentsDocs`;

    if (req.files) {
      if (req.files.aadharImg) {
        const filePath = req.files.aadharImg[0].path;
        const buffer = fs.readFileSync(filePath);
        const blobName = `${blobFolder}/aadhar-${path.basename(filePath)}`;
        const uploadResult = await uploadFileToAzure(buffer, blobName);
        studentData.adhar_front_back = uploadResult.url;
      }

      if (req.files.pancardImg) {
        const filePath = req.files.pancardImg[0].path;
        const buffer = fs.readFileSync(filePath);
        const blobName = `${blobFolder}/pancard-${path.basename(filePath)}`;
        const uploadResult = await uploadFileToAzure(buffer, blobName);
        studentData.pancard_front_back = uploadResult.url;
      }

      if (req.files.parentDocsImg) {
        const filePath = req.files.parentDocsImg[0].path;
        const buffer = fs.readFileSync(filePath);
        const blobName = `${blobFolder}/parent-aadhar-${path.basename(
          filePath
        )}`;
        const uploadResult = await uploadFileToAzure(buffer, blobName);
        studentData.parent_adhar_front_back = uploadResult.url;
      }

      if (req.files.profile_image) {
        console.log("profile", req.files.profile_image);

        const file = req.files.profile_image[0];
        const buffer = fs.readFileSync(file.path);
        const mimeType = file.mimetype;
        const blobName = `${blobFolder}/profile-${path.basename(
          file.filename
        )}`;
        const uploadResult = await uploadFileToAzure(
          buffer,
          blobName,
          mimeType
        );
        studentData.profile_image = blobName;
      }
    }
    //

    const data = await studentService.addStudent(studentData);
    res
      .status(201)
      .json({ student: data, message: "Student added successfully" });
  }),

  getStudent: try_catch(async (req, res) => {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment ID is required",
      });
    }

    const student = await studentService.getStudent(enrollmentId);

    res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  }),

  getAllStudents: try_catch(async (req, res) => {
    console.log("Received Query Params:", req.query);

    const students = await studentService.getAllStudents({ ...req.query });
    // const students = await studentService.getmyData("hello");
    console.log(students, "************* students");

    return res.status(200).json({
      success: true,
      students,
    });
  }),
  checkDetails: try_catch(async (req, res) => {
    console.log("Received Query Params:", req.query);
    if (!(req.query.contact_no || req.query.adhar_no)) {
      throw new customError("all fields are required ", 400);
    }
    const students = await studentService.checkDetails(req.query);
    if (students) {
      throw new customError("student already exists with this adhar no  ");
    }
    const check = await studentService.checkConDetails(req.query);
    if (check) {
      throw new customError("student already exists with this contact no");
    }
    // const students = await studentService.getmyData("hello");
    console.log(students, "************* students");

    return res.status(200).json({
      success: true,
      // students,
    });
  }),

  updateStudentrt: try_catch(async (req, res) => {
    const { id } = req.params;
    const updateDt = await studentService.updateStudentrt(id);

    if (!updateDt) {
      throw new customError("id not recognized", 400);
    }
    res.status(200).json({ message: "rt updated successfully", updateDt });
  }),

  updateStudentStatus: try_catch(async (req, res) => {
    const { id } = req.params;
    const result = await studentService.updateStudentStatus(id);

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: result,
    });
  }),

  // uploadFile: try_catch(async (req, res) => {
  //   try {
  //     console.log("0000000000000000000");
  //     console.log("req.file: ", req.file);
  //     console.log("req.body: ", req.body);

  //     if (!req.file) {
  //       throw new customError("No file uploaded", 404);
  //     }

  //     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  //     const sheetName = workbook.SheetNames[0];
  //     const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  //     const { course_id, batch_id } = req.body;
  //     if (!course_id) {
  //       throw new customError("Course ID is required", 400);
  //     }
  //     const batchExists = await batchesRepositorie.findOne({
  //       id: batch_id,
  //       status: "active",
  //     });
  //     const courseExists = await coursesRepository.findOne({
  //       id: course_id,
  //       status: "active",
  //     });

  //     if (!courseExists) {
  //       throw new Error("Invalid course. Course does not exist.");
  //     }
  //     if (!batchExists) {
  //       throw new Error("Invalid batch. Course does not exist.");
  //     }

  //     for (const row of data) {
  //       console.log("Saving row:", row);

  //       await Student.create({
  //         name: row["name"],
  //         address: row["address"] || null,
  //         adhar_no: row["adhar_no"] || null,
  //         pancard_no: row["pancard_no"] || null,
  //         email: row["email"] || null,
  //         contact_no: row["contact_no"] || null,
  //         father_name: row["father_name"] || null,
  //         mother_name: row["mother_name"] || null,
  //         parent_adhar_no: row["parent_adhar_no"] || null,
  //         parent_acc_no: row["parent_account_no"] || null,
  //         ifsc_no: row["ifsc_no"] || null,
  //         category: row["category"] || null,
  //         ex_school: row["ex_school"] || null,
  //         gender: row["gender"] || null,
  //         serial_no: row["serial_no"] || null,
  //         dob: row["dob"],
  //         course_id,
  //         batch_id,
  //       });
  //     }

  //     res.status(201).json({ message: "Students uploaded successfully" });
  //   } catch (err) {
  //     if (err.name === "SequelizeValidationError") {
  //       const errors = err.errors.map(e => ({
  //         field: e.path,
  //         message: e.message.replace(/^Student\./, ""),
  //       }));
  //       return res.status(400).json({ message: "Validation failed", errors });
  //     }
  //     throw err; // Let try_catch handle other errors
  //   }
  // }),

  // uploadFile: try_catch(async (req, res) => {
  //   try {
  //     console.log("0000000000000000000");
  //     console.log("req.file: ", req.file);
  //     console.log("req.body: ", req.body);

  //     if (!req.file) {
  //       throw new customError("No file uploaded", 404);
  //     }

  //     const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  //     const sheetName = workbook.SheetNames[0];
  //     const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  //     const { course_id, batch_id } = req.body;
  //     if (!course_id) {
  //       throw new customError("Course ID is required", 400);
  //     }
  //     const batchExists = await batchesRepositorie.findOne({
  //       id: batch_id,
  //       status: "active",
  //     });
  //     const courseExists = await coursesRepository.findOne({
  //       id: course_id,
  //       status: "active",
  //     });

  //     if (!courseExists) {
  //       throw new Error("Invalid course. Course does not exist.");
  //     }
  //     if (!batchExists) {
  //       throw new Error("Invalid batch. Course does not exist.");
  //     }

  //     for (const row of data) {
  //       console.log("Saving row:", row);

  //       await Student.create({
  //         name: row["name"],
  //         address: row["address"] || null,
  //         adhar_no: row["adhar_no"] || null,
  //         pancard_no: row["pancard_no"] || null,
  //         email: row["email"] || null,
  //         contact_no: row["contact_no"] || null,
  //         father_name: row["father_name"] || null,
  //         mother_name: row["mother_name"] || null,
  //         parent_adhar_no: row["parent_adhar_no"] || null,
  //         parent_acc_no: row["parent_account_no"] || null,
  //         ifsc_no: row["ifsc_no"] || null,
  //         category: row["category"] || null,
  //         ex_school: row["ex_school"] || null,
  //         gender: row["gender"] || null,
  //         serial_no: row["serial_no"] || null,
  //         dob: row["dob"],
  //         course_id,
  //         batch_id,
  //       });
  //     }

  //     res.status(201).json({ message: "Students uploaded successfully" });
  //   } catch (err) {
  //     if (err.name === "SequelizeValidationError") {
  //       const errors = err.errors.map(e => ({
  //         field: e.path,
  //         message: e.message.replace(/^Student\./, ""),
  //       }));
  //       return res.status(400).json({ message: "Validation failed", errors });
  //     }
  //     throw err; // Let try_catch handle other errors
  //   }
  // }),

  uploadFile: try_catch(async (req, res) => {
    const { course_id, batch_id, session_id } = req.body;

    // Validate file exists
    if (!req.file) {
      throw new customError("No file uploaded", 404);
    }

    // Validate file extension
    if (!req.file.originalname.match(/\.(xlsx)$/)) {
      throw new customError("Only .xlsx files are allowed", 400);
    }

    // ✅ Delegate to service
    await studentService.uploadStudentsFromExcel(
      req.file.buffer,
      course_id,
      batch_id,
      session_id
    );

    res.status(201).json({ message: "Students uploaded successfully" });
  }),

  getInactiveStudents: try_catch(async (req, res) => {
    const {
      sessionId,
      name,
      email,
      contact_no,
      page = 1,
      pageSize = 10,
    } = req.query;

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const data = await studentService.getInactiveStudentsBySession(
      sessionId,
      name,
      email,
      contact_no,
      limit,
      offset
    );

    const totalPages = Math.ceil(data.count / limit);
    const currentPage = parseInt(page);

    if (currentPage > totalPages && totalPages > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number. Exceeds total pages.",
        totalRecords: data.count,
        totalPages: totalPages,
      });
    }

    res.status(200).json({
      students: data.rows,
      totalRecords: data.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(data.count / limit),
    });
  }),

  //////

  //   getallstudentsController: try_catch(async (req, res) => {
  //     const database = await studentService.getAllStudents({ ...req.query });

  //     return res.status(200).json({
  //       success: true,
  //       data: database.data,
  //       pagination: database.pagination
  // })
  //   })
  //    updateStudentController: try_catch(async (req, res) => {
  //     const data = await studentService.updateStudent(req.body);

  //     res.status(200).json({
  //       status: "success",
  //       data: data
  //     });
  //   }),

  exportStudentsToExcel: try_catch(async (req, res) => {
    const { course_id, batch_id, session_id } = req.query;

    const students = await studentService.getFilteredStudentsForExport(
      course_id,
      batch_id,
      session_id
    );
    // res.send({students})
    const excelData = students.map((student) => ({
      Enrollment_ID: student.enrollment_id,
      Name: student.name,
      Father_Name: student.father_name,
      Contact: student.contact_no,
      Course: student.Course?.course_name,
      Batch: student.Batch?.BatchesName,
      Session_Year: student.Batch?.Session?.session_year,
      Status: student.status,
      RT: student.rt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const filePath = path.join(
      __dirname,
      "../exports",
      `students_export_${Date.now()}.xlsx`
    );
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, "students_data.xlsx", (err) => {
      if (err) {
        console.error("File download error:", err);
      }

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error("File delete error:", unlinkErr);
      });
    });
  }),

  updateStudent: try_catch(async (req, res) => {
    const updateData = req.body;
    // console.log("FILES RECEIVED:", req.files,"88888888888888888888888");
    const enrollmentId = req.params.enrollmentId;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: "Enrollment ID is required",
      });
    }

    // ✅ Handle multiple files (aadhaar, panCard, profile_image)
    const fileFields = [
      "adhar_front_back",
      "pancard_front_back",
      "profile_image",
    ];

    for (let field of fileFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const file = req.files[field][0];
        const buffer = fs.readFileSync(file.path);
        const blobName = `studentsDocs/${field}/${Date.now()}-${
          file.originalname
        }`;
        const uploadResult = await uploadFileToAzure(
          buffer,
          blobName,
          file.mimetype
        );

        if (!uploadResult.success) {
          return res.status(500).json({
            success: false,
            message: `${field} upload failed`,
            error: uploadResult.error,
          });
        }

        // Save in DB
        updateData[field] = blobName;
        // console.log(updateData,"*************************** updateData")
        // console.log(uploadResult,"*************************** uploadResult")
      }
    }

    // ✅ Handle email optional
    if (!updateData.email || updateData.email === "undefined") {
      delete updateData.email;
    }

    // ✅ Split student + enrollment fields
    const enrollmentFields = ["course_id", "batch_id", "session_id"];
    const studentData = {};
    const enrollmentData = {};

    for (let key in updateData) {
      if (enrollmentFields.includes(key)) {
        enrollmentData[key] = updateData[key];
      } else {
        studentData[key] = updateData[key];
      }
    }

    const updatedStudent = await studentService.updateStudentByEnrollmentId(
      enrollmentId,
      studentData,
      enrollmentData
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found or update failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  }),

  getStudentCourseDetails: try_catch(async (req, res) => {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({
        message: "Enrollment ID is required",
      });
    }

    const courseDetails =
      await studentService.getStudentCourseDetailsByEnrollment(enrollmentId);

    return res.status(200).json({
      message: "Successfully fetched course details",
      data: courseDetails,
    });
  }),

  getStudentBatchDetails: try_catch(async (req, res) => {
    const { studentId } = req.params;

    const result = await studentService.getStudentBatchDetails(studentId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.status(200).json(result);
  }),

  studentdetailscontroller: try_catch(async (req, res) => {
    const data = await studentService.studentdetails(req.query.id);
    return res.status(200).json(data);
  }),
  // ⬇️ Generate certificate and stream it back
  generateCertificateByStudentId: try_catch(async (req, res) => {
    const { id } = req.params;
    const { endDate } = req.body; // <— NEW: user-supplied batch end date (ISO‐8601)

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing student ID",
      });
    }

    /* 1️⃣  Generate & upload certificate – now forwards endDate override */
    const uploadResult = await studentService.generateCertificateAndUpload(
      id,
      endDate // <— pass along (may be undefined)
    );

    /* 2️⃣  Persist URL */
    await cetificateRepositorie.create({
      student_id: id,
      url: uploadResult.url,
    });

    /* 3️⃣  Stream the JPEG back to the client */
    const blobName = `certificates/${uploadResult.url.split("/").pop()}`;
    const blobResponse = await getBlob(blobName, "certificates");

    if (!blobResponse?.readableStreamBody) {
      throw new customError("Failed to fetch certificate from storage", 500);
    }

    res
      .setHeader("Content-Type", "image/jpeg")
      .setHeader(
        "Content-Disposition",
        `attachment; filename=certificate-${id}.jpg`
      );

    blobResponse.readableStreamBody.pipe(res);
  }),
  getCertificateDatesByStudentId: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing student ID",
      });
    }

    const result = await studentService.getCertificateDates(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Batch dates retrieved successfully",
      data: result,
    });
  },
};

module.exports = student;
