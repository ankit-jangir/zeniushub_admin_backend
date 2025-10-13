// const { faker } = require("@faker-js/faker");
const fs = require("fs");
const { studentRepositories } = require("../repositories/student.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
// const { stuaccessRepositories } = require("../repositories/stuaccessRepositories.repo");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis.config");
const { Op, DATE } = require("sequelize");
const { Batches, Student, Session, Course, Student_Enrollment } = require("../models/index");
const batchesRepositorie = new batchesRepositories();
const studentRepository = new studentRepositories();
const coursesRepository = new CoursesRepositories();
// const accessRepositorie = new stuaccessRepositories()
const { mystuaccessRepositories } = require("../repositories/studentEmrollment.repo")
const mystuaccessRepositorie = new mystuaccessRepositories()
// const { Batches, Session, Course } = require('../models');
const XLSX = require("xlsx");
const {
  deleteFromAzure,
  uploadFileToAzure,
} = require("../utils/azureUploader");
const customError = require("../utils/error.handler");
const path = require("path");
const {
  generateCertificateImage,
} = require("../utils/certificateImageGenerator");
// const ejs = require("ejs");
// const puppeteer = require('puppeteer');
const { studentcertificate } = require("../models/studentcertificate");
const {
  StudentCertificateRepositories,
} = require("../repositories/studentcertificate.repo");
const { accessRepositories, stuaccessRepositories } = require("../repositories/studentEmrollment.repo");
const StudentCertificateRepositorie = new StudentCertificateRepositories();

const studentService = {
  addStudent: async (data) => {
    const existingStudent = await studentRepository.getOneData({
      adhar_no: data.adhar_no,
    });

    if (existingStudent) {
      throw new customError("Student with this adhar_no already exists");
    }

    // Destructure out enrollment-related data
    const {
      course_id,
      batch_id,
      session_id,
      fees,
      discount_amount,
      number_of_emi,
      joining_date,
      ...studentData
    } = data;
    //  /
    // Save student data
    const newStudent = await studentRepository.create(studentData);
    console.log(newStudent);

    // ⚠️ Make sure to use `id` NOT `enrollment_id`
    const student_id = newStudent.id;

    if (!student_id) {
      throw new customError("Student ID not found after creation");
    }

    // Fetch course_duration from Courses table
  const course = await Course.findByPk(course_id, {
    attributes: ["course_duration"],
  });

  if (!course || !course.course_duration) {
    throw new customError("Course not found or course_duration missing");
  }

  // Calculate ending_course_date
  const joiningDate = joining_date ? new Date(joining_date) : new Date(); // Use provided joining_date or current date
  const endingCourseDate = new Date(joiningDate);
  endingCourseDate.setMonth(endingCourseDate.getMonth() + course.course_duration);

  // Format ending_course_date as YYYY-MM-DD (since DATEONLY expects this)
  const formattedEndingCourseDate = endingCourseDate.toISOString().split('T')[0];

    // Prepare enrollment data
    const enrollmentData = {
      student_id,
      course_id,
      batch_id,
      session_id,
      fees,
      discount_amount,
      number_of_emi,
      ending_course_date: formattedEndingCourseDate,
    };

    // Save enrollment record
    const newEnrollment = await mystuaccessRepositorie.create(enrollmentData);

    return {
      success: true,
      message: "Student and enrollment created successfully",
      student: newStudent,
      enrollment: newEnrollment,
    };
  },

  getAllStudents: async (filters) => {
    const { count, rows } = await studentRepository.getAllStudents(filters);

    const limit = +filters.limit || 10;
    const page = +filters.page || 1;

    if (filters.session_id && count === 0) {
      throw new customError("No students found for this session");
    }
    const plainRows = rows.map(row => row.get({ plain: true }));

    // ✅ Map status: true → "active", false → "inactive"
    const modifiedRows = plainRows.map((student) => {
      if (student.enrollment && typeof student.enrollment.status === "boolean") {
        student.enrollment.status = student.enrollment.status ? "active" : "inactive";
      }
      return student;
    });

    return {
      data: modifiedRows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  },




  getStudent: async (enrollmentId) => {
    const student = await studentRepository.getByStudentId(enrollmentId);

    if (!student) {
      throw new customError("Student not found", 404);
    }

    // ✅ Convert to plain if it's a Sequelize object (avoid circular error)
    const plainStudent = student.get ? student.get({ plain: true }) : student;

    if (
      plainStudent.enrollment &&
      typeof plainStudent.enrollment.status === "boolean"
    ) {
      plainStudent.enrollment.status = plainStudent.enrollment.status
        ? "active"
        : "inactive";
    }

    return plainStudent;
  },


  updateStudentStatus: async (id) => {
    const enrollment = await mystuaccessRepositorie.getEnrollmentById(id);

    if (!enrollment) {
      throw new customError("Enrollment ID not recognized", 404);
    }

    const currentStatus = Boolean(enrollment.status);
    const newStatus = !currentStatus;
    let whereCondition = { status: newStatus }
    if (!newStatus) {
      whereCondition.course_status = "dropped"
    }
    // else{
    //  whereCondition.course_status="ongoing"
    // }
    const [rowsUpdated] = await mystuaccessRepositorie.update(
      whereCondition,
      { id: id } // ✅ This is necessary
    );

    console.log("Rows updated:", rowsUpdated);

    if (!rowsUpdated || rowsUpdated === 0) {
      throw new customError("Status update failed", 400);
    }

    return {
      id,
      newStatus: newStatus ? "active" : "inactive",
    };
  },

  getInactiveStudentsBySession: async (
    sessionId,
    name,
    email,
    contact_no,
    limit,
    offset
  ) => {
    const result = await studentRepository.getInactiveStudentsBySession(
      sessionId,
      name,
      email,
      contact_no,
      limit,
      offset
    );

    // ✅ status ko string me convert karo
    const updatedRows = result.rows.map((studentInstance) => {
      const student = studentInstance.toJSON(); // ✅ convert to plain object
      const enrollment = student.enrollment;

      return {
        ...student,
        enrollment: {
          ...enrollment,
          status: enrollment.status ? "active" : "inactive", // ✅ boolean to string
        },
      };
    });

    return {
      count: result.count,
      rows: updatedRows,
    };
  },


  updateStudentByEnrollmentId: async (enrollmentId, studentData = {}, enrollmentData = {}) => {
    const enrollment = await Student_Enrollment.findOne({
      where: { id: enrollmentId },
      include: [{ model: Student }],
    });

    console.log(studentData,"77777777777777777777777 studentData")


    if (!enrollment || !enrollment.Student) return null;

    const student = enrollment.Student;

    // ✅ Check for each file field and delete old if replaced
    // const fileFields = ["profile_image", "adhar_front_back", "pancard_front_back"];
    // for (let field of fileFields) {
    //   if (studentData[field] && student[field] && studentData[field] !== student[field]) {
    //     await deleteFromAzure(student[field]);
    //   }
    // }

    // ✅ Update student
    await student.update(studentData);

    // ✅ Update enrollment if needed
    if (Object.keys(enrollmentData).length > 0) {
      await enrollment.update(enrollmentData);
    }

    const updatedWithRelations = await Student_Enrollment.findOne({
      where: { id: enrollmentId },
      include: [
        { model: Student },
        { model: Course },
        { model: Batches },
        { model: Session },
      ],
    });

    return updatedWithRelations;
  },


  uploadStudentsFromExcel: async (fileBuffer, course_id, batch_id, session_id) => {
    if (!fileBuffer) throw new customError("No file uploaded", 404);

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const requiredHeaders = [
      "enrollment_id",
      "name",
      "address",
      "adhar_no",
      "email",
      "contact_no",
      "father_name",
      "mother_name",
      "dob",
      "rt",
      "gender"
    ];

    const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] || [];
    const excelHeaders = firstRow.map((h) => (h || "").toString().trim());

    const missingHeaders = requiredHeaders.filter((h) => !excelHeaders.includes(h));
    const extraHeaders = excelHeaders.filter((h) => !requiredHeaders.includes(h));

    if (missingHeaders.length > 0 || extraHeaders.length > 0) {
      throw new customError(`Invalid Excel format. Headers must exactly match: ${requiredHeaders.join(", ")}`, 400);
    }

    if (!course_id || !batch_id || !session_id) {
      throw new customError("course_id, batch_id, and session_id are required", 400);
    }

    const batchExists = await batchesRepositorie.findOne({ id: batch_id, status: "active" });
    const courseExists = await coursesRepository.findOne({ id: course_id, status: "active" });

    if (!courseExists) throw new customError("Invalid course. Course does not exist.");
    if (!batchExists) throw new customError("Invalid batch. Batch does not exist.");

    for (const row of data) {
      // Check if adhar_no already exists
      if (row["adhar_no"]) {
        // Convert adhar_no to string to match the database type (character varying)
        const adharNo = String(row["adhar_no"]).trim();
        const existingStudent = await Student.findOne({ where: { adhar_no: adharNo } });
        if (existingStudent) {
          console.log(`Skipping student with adhar_no ${adharNo} as it already exists.`);
          continue; // Skip to the next row
        }
      }

      const createdStudent = await Student.create({
        name: row["name"],
        address: row["address"] || null,
        adhar_no: row["adhar_no"] ? String(row["adhar_no"]).trim() : null, // Ensure adhar_no is a string
        pancard_no: row["pancard_no"] || null,
        email: row["email"] || null,
        contact_no: row["contact_no"] || null,
        father_name: row["father_name"] || null,
        mother_name: row["mother_name"] || null,
        parent_adhar_no: row["parent_adhar_no"] || null,
        parent_acc_no: row["parent_account_no"] || null,
        ifsc_no: row["ifsc_no"] || null,
        category: row["category"] || null,
        ex_school: row["ex_school"] || null,
        gender: row["gender"] || null,
        serial_no: row["serial_no"] || null,
        dob: row["dob"],
        rt: row["rt"] || false,
        enrollment_id: row["enrollment_id"],
      });
      console.log("createdStudent", createdStudent);

      await Student_Enrollment.create({
        student_id: createdStudent.id,
        course_id,
        batch_id,
        session_id,
        ending_course_date: "2025-09-25"
      });
    }
},

  getStudentCourseDetailsByEnrollment: async (enrollmentId) => {
    const enrollment = await Student_Enrollment.findOne({
      where: { id: enrollmentId },
      include: [
        {
          model: Course,
          attributes: ["course_name", "course_price"],
        },
      ],
    });

    if (!enrollment || !enrollment.Course) {
      throw new customError("Course details not found for this enrollment");
    }

    return {
      enrollment_id: enrollment.id,
      course_name: enrollment.Course.course_name,
      course_price: enrollment.Course.course_price,
    };
  },

  getStudentBatchDetails: async (studentId) => {
    return await studentRepository.getDataById(studentId); // Uses overridden method
  },



  checkConDetails: async (query) => {
    // return studentRepository.findOne({adhar_no:query.adhar_no})
    return studentRepository.findOne({ contact_no: query.contact_no });
  },

  checkDetails: async (query) => {
    return studentRepository.findOne({ adhar_no: query.adhar_no });
    // return studentRepository.findOne({contact_no:query.contact_no})
  },

  updateStudentrt: async (id) => {
    // Get the current student
    const student = await studentRepository.getDataById(id);


    const stu = await studentRepository.getOneData(student.student_id);


    // Toggle boolean value (true -> false, false -> true)
    const newRTValue = !stu?.rt;
    await studentRepository.update({ rt: newRTValue }, { id: stu.id });

    return { id, newRTValue };
  },



  studentdetails: async (id) => {
    const data = await studentRepository.getDataById(id);
    const batch = data.batch_id;
    const userdaataforbatch = await batchesRepositorie.getDataById(batch);

    const startdate = new Date(userdaataforbatch.StartDate);
    const enddate = new Date(userdaataforbatch.EndDate);
    const currentDate = new Date();

    if (startdate > currentDate || enddate > currentDate) {
      throw new customError("Start Date or End Date should not be in the future.");
    }

    return {
      data,
      userdaataforbatch,
    };
  },


  generateCertificateAndUpload: async (studentId, overrideEndDate) => {
    const student = await studentRepository.getDataByIds(studentId);
    if (!student) throw new customError("Student not found", 404);

    // ⬇️ Pass the override date down to the image-generation util
    const uploadResult = await generateCertificateImage(
      student,
      overrideEndDate // <— NEW
    );

    if (!uploadResult.success) {
      throw new customError("Failed to upload certificate", 500);
    }

    return uploadResult; // { success: true, url: "…" }
  },
  getCertificateDates: async (studentId) => {
    const student = await studentRepository.getDataByIds(studentId);
    console.log("1111111111", student);

    if (!student) throw new customError("Student not found", 404);
    if (!student.Batch) throw new customError("Batch not found", 404);

    return {
      startDate: student.Batch.StartDate,
      endDate: student.Batch.EndDate,
    };
  },



};

module.exports = studentService;
