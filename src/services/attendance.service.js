const { attendencerepositries } = require("../repositories/attendence.repo");
const { studentRepositories } = require("../repositories/student.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
const {
  mystuaccessRepositories,
} = require("../repositories/studentEmrollment.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const {
  Attendance,
  Batches,
  Student,
  Course,
  Student_Enrollment,
  Session
} = require("../models/index");

const attendencerepositrie = new attendencerepositries();
const studentRepository = new studentRepositories();
const batchesRepositorie = new batchesRepositories();
const accessRepositori = new mystuaccessRepositories();

const { Op } = require("sequelize");
const ExcelJS = require("exceljs");
const customError = require("../utils/error.handler");
const moment = require("../utils/time-zone");

attendanceservice = {
  checkIn: async (enrollment_id) => {
    // 1. ✅ Find student by enrollment ID
    const student = await studentRepository.findOne({ enrollment_id });
    if (!student) {
      return { success: false, message: "Student not found" };
    }

    // 2. ✅ Find batch from student's batch_id
    const batch = await batchesRepositorie.getDataById(student.batch_id);
    if (!batch) {
      return { success: false, message: "Batch not found" };
    }

    // 3. 📆 Get today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];
    console.log("todayyyyyyy", today);

    // 4. 🔁 Check if attendance already marked today
    const existing = await attendencerepositrie.findOne({
      enrollment_id,
      attendance_date: today,
    });

    // 5. ⏰ Current time as HH:mm format
    const now = new Date();
    const in_time = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    console.log(in_time);

    // 6. ✅ Status calculation
    const getCheckInStatus = (batchStart, checkIn) => {
      // Convert "HH:mm" into Date objects on today's date
      const today = new Date();

      const parseTime = (timeStr) => {
        const full = `${today}T${timeStr}:00`; // e.g. "2025-04-19T09:30:00"
        return new Date(full);
      };

      const batchTime = parseTime(batchStart);
      const checkInTime = parseTime(checkIn);

      const diffMs = checkInTime - batchTime;
      const diffMins = Math.floor(diffMs / 60000); // convert ms to minutes

      if (diffMins > 180) return "absent";
      if (diffMins > 60) return "half day";
      return "present";
    };

    const status = getCheckInStatus(batch.start_time, in_time);

    // 7. 📝 Save attendance
    const created = await attendencerepositrie.create({
      enrollment_id,
      batch_id: student.batch_id,
      attendance_date: today,
      in_time,
      out_time: null,
      status,
    });

    return {
      success: true,
      message: "Check-in marked successfully",
      data: created,
    };
  },

  checkOut: async (enrollment_id) => {
    if (!enrollment_id)
      return { success: false, message: "enrollment_id required" };

    const student = await studentRepository.findOne({ enrollment_id });
    if (!student) return { success: false, message: "Student not found" };

    const batch = await batchesRepositorie.getDataById(student.batch_id);
    if (!batch) return { success: false, message: "Batch not found" };

    if (!batch.StartTime || !batch.EndTime) {
      return { success: false, message: "Batch start/end time missing" };
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await attendencerepositrie.findOne({
      enrollment_id,
      attendance_date: today,
    });

    if (!existing) return { success: false, message: "No check‑in today" };
    if (existing.out_time)
      return { success: false, message: "Already checked‑out" };

    // Actual check‑out time
    const now = new Date();
    const out_time = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Inline parsing
    const [sh, sm] = batch.StartTime.split(":").map(Number);
    const [eh, em] = batch.EndTime.split(":").map(Number);
    const [ih, im] = existing.in_time.split(":").map(Number);
    const [oh, om] = out_time.split(":").map(Number);

    const batchStartDate = new Date();
    batchStartDate.setHours(sh, sm, 0, 0);
    const batchEndDate = new Date();
    batchEndDate.setHours(eh, em, 0, 0);
    const inDate = new Date();
    inDate.setHours(ih, im, 0, 0);
    const outDate = new Date();
    outDate.setHours(oh, om, 0, 0);

    const duration = (outDate - inDate) / 60000; // mins
    const fullDuration = (batchEndDate - batchStartDate) / 60000;

    let finalStatus = existing.status;
    if (duration >= fullDuration - 15) finalStatus = "present";
    else if (duration >= fullDuration / 2) finalStatus = "half day";
    else finalStatus = "absent";

    // Update by primary key
    await attendencerepositrie.update(
      { out_time, status: finalStatus },
      { id: existing.id }
    );

    return {
      success: true,
      message: "Check‑out marked",
      data: { ...existing.dataValues, out_time, status: finalStatus },
    };
  },

  // getFilteredAttendance: async ({
  //   sessionId,
  //   enrollment_id,
  //   name,
  //   batch,
  //   date,
  //   page = 1,
  //   limit = 10,
  // }) => {
  //   page = parseInt(page, 10) || 1;
  //   limit = parseInt(limit, 10) || 10;
  //   const offset = (page - 1) * limit;

  //   const studentWhere = { status: "active" };
  //   if (enrollment_id)
  //     studentWhere.enrollment_id = { [Op.iLike]: `%${enrollment_id.trim()}%` };
  //   if (name)
  //     studentWhere.name = { [Op.iLike]: `%${name.trim()}%` };

  //   const batchWhere = { Session_id: sessionId };
  //   if (batch)
  //     batchWhere.BatchesName = { [Op.iLike]: `%${batch.trim()}%` };

  //   // const dateWhere = date ? { attendance_date: date } : {};
  //   const today = new Date();
  // today.setHours(0, 0, 0, 0);

  // const dateWhere = date
  //   ? { attendance_date: date }
  //   : { attendance_date: { [Op.lte]: today } }; // protects against accidental future entries

  //   // Get all students (active + batch/course active)
  //   const allStudents = await studentRepository.model.findAll({
  //     where: studentWhere,
  //     include: [
  //       {
  //         association: "Batch",
  //         required: true,
  //         where: {
  //           ...batchWhere,
  //           status: "active",
  //         },
  //         include: [
  //           {
  //             association: "Course",
  //             required: true,
  //             where: {
  //               status: "active",
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   });

  //   const totalStudent = allStudents.length;
  //   const allStudentMap = new Map();
  //   allStudents.forEach((stu) => {
  //     allStudentMap.set(stu.enrollment_id, stu);
  //   });

  //   const attendanceRows = await attendencerepositrie.model.findAll({
  //     where: {
  //       ...dateWhere,
  //       status: {
  //         [Op.in]: ["present", "half day"],
  //       },
  //     },
  //     include: [
  //       {
  //         association: "Student",
  //         required: true,
  //         where: studentWhere,
  //         attributes: ["name", "enrollment_id", "status"],
  //         include: [
  //           {
  //             association: "Batch",
  //             required: true,
  //             where: {
  //               ...batchWhere,
  //               status: "active",
  //             },
  //             attributes: ["BatchesName", "Session_id"],
  //             include: [
  //               {
  //                 association: "Course",
  //                 required: true,
  //                 where: {
  //                   status: "active",
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     ],
  //     order: [["attendance_date", "DESC"]],
  //   });

  //   let totalPresent = 0,
  //     totalHalfday = 0;
  //   const presentEnrollmentIds = new Set();

  //   const presentData = attendanceRows.map((item) => {
  //     const student = item.Student.toJSON();
  //     const attendanceStatus = item.status?.toLowerCase();

  //     if (attendanceStatus === "present") totalPresent++;
  //     else if (attendanceStatus === "half day") totalHalfday++;

  //     presentEnrollmentIds.add(student.enrollment_id);

  //     return {
  //       ...item.toJSON(),
  //     };
  //   });

  //   const absentData = [];
  //  const todays = new Date();
  // todays.setHours(0, 0, 0, 0); // normalize time to start of day

  // const targetDate = date ? new Date(date) : todays;
  // targetDate.setHours(0, 0, 0, 0); // normalize

  // // Only generate "absent" if date is today or before
  // if (targetDate <= todays) {
  //   for (const student of allStudents) {
  //     if (!presentEnrollmentIds.has(student.enrollment_id)) {
  //       absentData.push({
  //         attendance_date: date,
  //         in_time: null,
  //         out_time: null,
  //         status: "absent",
  //         Student: {
  //           ...student.toJSON(),
  //         },
  //       });
  //     }
  //   }
  // }

  //   const totalAbsent = totalStudent - (totalPresent + totalHalfday);
  //   const finalData = [...presentData, ...absentData];
  //   const paginatedData = finalData.slice(offset, offset + limit);

  //   return {
  //     total: finalData.length,
  //     page,
  //     totalPages: Math.ceil(finalData.length / limit),
  //     limit,
  //     totalStudent,
  //     totalPresent,
  //     totalAbsent,
  //     totalHalfday,
  //     data: paginatedData,
  //   };
  // },

  // getFilteredAttendance: async ({
  //   sessionId,
  //   enrollment_id,
  //   name,
  //   batch,
  //   date,
  //   page = 1,
  //   limit = 10,
  //   status,
  // }) => {
  //   if (!date) throw new customError("Date is required");

  //   const parsedDate = new Date(date);
  //   if (isNaN(parsedDate)) throw new customError("Invalid date format");

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   if (parsedDate.setHours(0, 0, 0, 0) > today.getTime()) {
  //   throw new customError("Cannot fetch attendance for a future date.");
  // }

  //   const startOfDay = new Date(parsedDate);
  //   startOfDay.setHours(0, 0, 0, 0);

  //   const endOfDay = new Date(parsedDate);
  //   endOfDay.setHours(23, 59, 59, 999);

  //   const targetDate = new Date(parsedDate);
  //   targetDate.setHours(0, 0, 0, 0);

  //   // ✅ your remaining logic stays untouched...

  //   const dateWhere = {
  //     attendance_date: {
  //       [Op.between]: [startOfDay, endOfDay],
  //     },
  //   };

  //   page = parseInt(page, 10) || 1;
  //   limit = parseInt(limit, 10) || 10;
  //   const offset = (page - 1) * limit;

  //   const studentWhere = { status: "active" };
  //   if (enrollment_id)
  //     studentWhere.enrollment_id = { [Op.iLike]: `%${enrollment_id.trim()}%` };
  //   if (name) studentWhere.name = { [Op.iLike]: `%${name.trim()}%` };

  //   const batchWhere = { Session_id: sessionId };
  //   if (batch) batchWhere.BatchesName = { [Op.iLike]: `%${batch.trim()}%` };

  //   // ✅ Use students who joined on or before the selected date
  //   const allStudents = await studentRepository.model.findAll({
  //     where: {
  //       ...studentWhere,
  //       joining_date: {
  //         [Op.lte]: endOfDay,
  //       },
  //     },
  //     include: [
  //       {
  //         association: "Batch",
  //         required: true,
  //         where: {
  //           ...batchWhere,
  //           status: "active",
  //         },
  //         include: [
  //           {
  //             association: "Course",
  //             required: true,
  //             where: {
  //               status: "active",
  //             },
  //           },
  //         ],
  //       },
  //     ],
  //   });

  //   const totalStudent = allStudents.length;
  //   const presentEnrollmentIds = new Set();

  //   const attendanceStatusFilter = status
  //     ? status === "absent"
  //       ? []
  //       : [status]
  //     : ["present", "half day"];

  //   const attendanceRows =
  //     attendanceStatusFilter.length > 0
  //       ? await attendencerepositrie.model.findAll({
  //           where: {
  //             ...dateWhere,
  //             status: { [Op.in]: attendanceStatusFilter },
  //           },
  //           include: [
  //             {
  //               association: "Student",
  //               required: true,
  //               where: {
  //                 ...(enrollment_id && {
  //                   enrollment_id: { [Op.iLike]: `%${enrollment_id.trim()}%` },
  //                 }),
  //                 ...(name && {
  //                   name: { [Op.iLike]: `%${name.trim()}%` },
  //                 }),
  //               },
  //               attributes: ["name", "enrollment_id", "status"],
  //               include: [
  //                 {
  //                   association: "Batch",
  //                   required: true,
  //                   where: {
  //                     ...batchWhere,
  //                     status: "active",
  //                   },
  //                   attributes: ["BatchesName", "Session_id"],
  //                   include: [
  //                     {
  //                       association: "Course",
  //                       required: true,
  //                       where: {
  //                         status: "active",
  //                       },
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ],
  //           order: [["attendance_date", "DESC"]],
  //         })
  //       : [];

  //   let totalPresent = 0,
  //     totalHalfday = 0;

  //   const formatDate = (dateObj) => {
  //     const local = new Date(dateObj);
  //     local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  //     return local.toISOString().split("T")[0];
  //   };

  //   const presentData = attendanceRows.map((item) => {
  //     const student = item.Student.toJSON();
  //     const attendanceStatus = item.status?.toLowerCase();

  //     if (attendanceStatus === "present") totalPresent++;
  //     else if (attendanceStatus === "half day") totalHalfday++;

  //     presentEnrollmentIds.add(student.enrollment_id);

  //     return {
  //       attendance_date: formatDate(item.attendance_date),
  //       in_time: item.in_time,
  //       out_time: item.out_time,
  //       status: attendanceStatus,
  //       Student: {
  //         name: student.name,
  //         enrollment_id: student.enrollment_id,
  //          batch: student.Batch?.BatchesName
  //       },
  //     };
  //   });

  //   const absentData = [];
  //   if (targetDate <= today && (!status || status === "absent")) {
  //     for (const student of allStudents) {
  //       if (!presentEnrollmentIds.has(student.enrollment_id)) {
  //         absentData.push({
  //           attendance_date: formatDate(targetDate),
  //           in_time: null,
  //           out_time: null,
  //           status: "absent",
  //           Student: {
  //             name: student.name,
  //             enrollment_id: student.enrollment_id,
  //             batch: student.Batch?.BatchesName
  //           },
  //         });
  //       }
  //     }
  //   }

  //   const totalAbsent = absentData.length;

  //   let finalData = [];
  //   if (status === "absent") finalData = absentData;
  //   else if (status === "present" || status === "half day")
  //     finalData = presentData;
  //   else finalData = [...presentData, ...absentData];

  //   const paginatedData = finalData.slice(offset, offset + limit);

  //   if (finalData.length === 0) {
  //     throw new customError("No attendance records found.");
  //   }

  //   return {
  //     total: finalData.length,
  //     page,
  //     totalPages: Math.ceil(finalData.length / limit),
  //     limit,
  //     totalStudent,
  //     totalPresent,
  //     totalAbsent,
  //     totalHalfday,
  //     data: paginatedData,
  //   };
  // }

  // getFilteredAttendance: async ({
  //   sessionId,
  //   date,
  //   name,
  //   course,
  //   batch,
  //   page = 1,
  //   limit = 10,
  //   status,
  // }) => {
  //   if (!date) throw new customError("Date is required");

  //   const parsedDate = new Date(date);
  //   if (isNaN(parsedDate)) throw new customError("Invalid date format");

  //   const startOfDay = new Date(parsedDate);
  //   startOfDay.setHours(0, 0, 0, 0);

  //   const endOfDay = new Date(parsedDate);
  //   endOfDay.setHours(23, 59, 59, 999);

  //   const studentEnrollmentWhere = { session_id: sessionId };
  //   if (course) studentEnrollmentWhere.course_id = course;

  //   console.log(studentEnrollmentWhere,"****************************studentEnrollmentWhere")
  //   // console.log(course,"****************************course")

  //   // ✅ Step 1: Search students by name (if provided)
  //   let studentIds = [];
  //   if (name) {
  //     const students = await Student.findAll({
  //       where: {
  //         name: {
  //           [Op.iLike]: `%${name.trim()}%`,
  //         },
  //       },
  //       attributes: ["id"],
  //     });
  //     studentIds = students.map((s) => s.id);

  //     // If no student matched, return empty result early
  //     if (studentIds.length === 0) {
  //       return {
  //         data: [],
  //         sessionId,
  //         total: 0,
  //         page,
  //         totalPages: 0,
  //         limit,
  //         totalPresent: 0,
  //         totalAbsent: 0,
  //         totalHalfDay: 0,
  //         totalStudent: 0,
  //       };
  //     }
  //   }

  //   // ✅ Step 2: Filter enrollments
  //   if (studentIds.length > 0) {
  //     studentEnrollmentWhere.student_id = { [Op.in]: studentIds };
  //   }

  //   console.log(studentEnrollmentWhere,"*************************88studentEnrollmentWhere")
  //   const allEnrollments = await Student_Enrollment.findAll({
  //     where: studentEnrollmentWhere,
  //     include: [
  //       {
  //         model: Student,
  //         attributes: ["id", "name", "enrollment_id"],
  //       },
  //       { model: Course },
  //       {
  //         model: Batches,
  //         attributes: ["BatchesName"],
  //         where: batch
  //           ? {
  //               BatchesName: {
  //                 [Op.iLike]: `%${batch.trim()}%`,
  //               },
  //             }
  //           : undefined,
  //       },
  //     ],
  //   });

  //   const enrollmentIds = allEnrollments.map((e) => e.id);

  //   // ✅ Step 3: Attendance data
  //   const attendanceRows = await Attendance.findAll({
  //     where: {
  //       student_enrollment_id: { [Op.in]: enrollmentIds },
  //       attendance_date: { [Op.between]: [startOfDay, endOfDay] },
  //     },
  //     attributes: [
  //       "id",
  //       "student_enrollment_id",
  //       "status",
  //       "attendance_date",
  //       "in_time",
  //       "out_time",
  //       "createdAt",
  //       "updatedAt",
  //     ],
  //     include: [
  //       {
  //         model: Student_Enrollment,
  //         as: "Student_Enrollment",
  //         include: [
  //           { model: Student, attributes: ["id", "name", "enrollment_id"] },
  //           { model: Course },
  //           { model: Batches, attributes: ["BatchesName"] },
  //         ],
  //       },
  //     ],
  //   });

  //   const presentEnrollmentIds = new Set();

  //   // ✅ Prepare present data
  //   const presentData = attendanceRows
  //     .map((item) => {
  //       const se = item.Student_Enrollment;
  //       if (!se) return null;

  //       presentEnrollmentIds.add(se.id);

  //       return {
  //         sessionId,
  //         attendance_date: date,
  //         in_time: item.in_time,
  //         out_time: item.out_time,
  //         status: item.status,
  //         Student: {
  //           name: se.Student.name,
  //           enrollment_id: se.Student.enrollment_id,
  //           batch: se.Batch?.BatchesName,
  //           course: se.Course?.CourseName,
  //         },
  //       };
  //     })
  //     .filter(Boolean);

  //   // ✅ Count half-day from present data (adjust if your half-day status is different)
  //   const totalHalfDay = presentData.filter((item) => item.status === "half-day").length;

  //   // ✅ Prepare absent data
  //   const absentData = [];
  //   if (!status || status === "absent") {
  //     for (const se of allEnrollments) {
  //       if (!presentEnrollmentIds.has(se.id)) {
  //         absentData.push({
  //           sessionId,
  //           attendance_date: date,
  //           in_time: null,
  //           out_time: null,
  //           status: "absent",
  //           Student: {
  //             name: se.Student.name,
  //             enrollment_id: se.Student.enrollment_id,
  //             batch: se.Batch?.BatchesName,
  //             course: se.Course?.CourseName,
  //           },
  //         });
  //       }
  //     }
  //   }

  //   // ✅ Combine final data based on status filter
  //   let finalData = [];
  //   if (status === "absent") finalData = absentData;
  //   else if (status === "present") finalData = presentData;
  //   else finalData = [...presentData, ...absentData];

  //   const total = finalData.length;
  //   const offset = (page - 1) * limit;
  //   const paginatedData = finalData.slice(offset, offset + limit);

  //   if (total === 0) throw new customError("No attendance records found.");

  //   return {
  //     data: paginatedData,
  //     sessionId,
  //     total,
  //     page,
  //     totalPages: Math.ceil(total / limit),
  //     limit,
  //     totalPresent: presentData.length,
  //     totalAbsent: absentData.length,
  //     totalHalfDay,
  //     totalStudent: allEnrollments.length,
  //   };
  // }

  getFilteredAttendance: async ({
    sessionId,
    date,
    name,
    course,
    batch,
    enrollment_id,
    page = 1,
    limit = 10,
    status,
  }) => {
    if (!date) throw new customError("Date is required");

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) throw new customError("Invalid date format");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate > today) {
      throw new customError("Future attendance records cannot be fetched.");
    }


    const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

    const sessionCheckInSessionModel = await Session.findAll({
      where:{id: sessionId},
      attributes:["id"]
    });    

    if(!sessionCheckInSessionModel) throw new customError("Invalid session id."); 

    const sessionCheck = await Student_Enrollment.findOne({
      where: { session_id: sessionId },
      attributes: ["id"],
    });
    if (!sessionCheck) throw new customError("Invalid sessionId.");

    const studentEnrollmentWhere = { session_id: sessionId };
    if (course) studentEnrollmentWhere.course_id = course;

    if (enrollment_id) {
      const student = await Student.findOne({
        where: { enrollment_id },
        attributes: ["id"],
      });

      if (!student) {
        return {
          success: true,
          message: "No attendance records found.",
          data: [],
          sessionId,
          total: 0,
          page,
          totalPages: 0,
          limit,
          totalPresent: 0,
          totalAbsent: 0,
          totalHalfDay: 0,
          totalStudent: 0,
        };
      }

      studentEnrollmentWhere.student_id = student.id;
    }

    if (name) {
      const students = await Student.findAll({
        where: { name: { [Op.iLike]: `%${name.trim()}%` } },
        attributes: ["id"],
      });

      const studentIds = students.map((s) => s.id);
      if (!studentIds.length) {
        return {
          success: true,
          message: "No attendance records found.",
          data: [],
          sessionId,
          total: 0,
          page,
          totalPages: 0,
          limit,
          totalPresent: 0,
          totalAbsent: 0,
          totalHalfDay: 0,
          totalStudent: 0,
        };
      }

      if (!studentEnrollmentWhere.student_id) {
        studentEnrollmentWhere.student_id = { [Op.in]: studentIds };
      }
    }

    const allEnrollments = await Student_Enrollment.findAll({
      where: studentEnrollmentWhere,
      include: [
        {
          model: Student,
          attributes: ["id", "name", "enrollment_id"],
          required: true,
        },
        { model: Course },
        {
          model: Batches,
          attributes: ["BatchesName"],
          where: batch
            ? { BatchesName: { [Op.iLike]: `%${batch.trim()}%` } }
            : undefined,
        },
      ],
      attributes: ["id", "student_id", "joining_date"],
    });

    const enrollmentIds = allEnrollments.map((e) => e.id);
    if (!enrollmentIds.length)
      throw new customError("No attendance records found.");

    const attendanceRows = await Attendance.findAll({
      where: {
        student_enrollment_id: { [Op.in]: enrollmentIds },
        attendance_date: { [Op.between]: [startOfDay, endOfDay] },
      },
      attributes: [
        "id",
        "student_enrollment_id",
        "status",
        "attendance_date",
        "in_time",
        "out_time",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Student_Enrollment,
          as: "Student_Enrollment",
          attributes: ["id", "joining_date"],
          include: [
            {
              model: Student,
              attributes: ["id", "name", "enrollment_id"],
              required: true,
            },
            { model: Course },
            { model: Batches, attributes: ["BatchesName"] },
          ],
        },
      ],
    });

    const presentEnrollmentIds = new Set();

    const presentData = attendanceRows
      .filter((item) => {
        const joiningDate = new Date(item.Student_Enrollment.joining_date);
        return new Date(item.attendance_date) >= joiningDate;
      })
      .map((item) => {
        const se = item.Student_Enrollment;
        presentEnrollmentIds.add(se.id);

        return {
          sessionId,
          attendance_date: date,
          in_time: item.in_time,
          out_time: item.out_time,
          status: item.status,
          Student: {
            name: se.Student.name || "Unknown",
            enrollment_id: se.Student.enrollment_id || "Unknown",
            batch: se.Batch?.BatchesName || "Unknown",
            course: se.Course?.CourseName || "Unknown",
          },
        };
      });

    const totalHalfDay = presentData.filter(
      (i) => i.status === "half day"
    ).length;

    const absentData =
      !status || status === "absent"
        ? allEnrollments
            .filter((se) => {
              const joiningDate = new Date(se.joining_date);
              return parsedDate >= joiningDate;
            })
            .filter((se) => !presentEnrollmentIds.has(se.id))
            .map((se) => ({
              sessionId,
              attendance_date: date,
              in_time: null,
              out_time: null,
              status: "absent",
              Student: {
                name: se.Student.name || "Unknown",
                enrollment_id: se.Student.enrollment_id || "Unknown",
                batch: se.Batch?.BatchesName || "Unknown",
                course: se.Course?.CourseName || "Unknown",
              },
            }))
        : [];

    let finalData = [];
    if (status === "absent") finalData = absentData;
    else if (status === "present") finalData = presentData;
    else finalData = [...presentData, ...absentData];

    const total = finalData.length;
    const offset = (page - 1) * limit;
    const paginatedData = finalData.slice(offset, offset + limit);

    if (!total) throw new customError("No attendance records found.");

    return {
      success: true,
      message: "Filtered attendance fetched successfully",
      data: paginatedData,
      sessionId,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      totalPresent: presentData.length,
      totalAbsent: absentData.length,
      totalHalfDay,
      totalStudent: allEnrollments.length,
    };
  },

  //   getStudentAttendance: async (enrollmentId, month, year) => {
  //   const today = moment().startOf("day");
  //   const requested = moment({ year, month: month - 1 }); // 0-indexed month

  //   if (requested.isAfter(today, "month")) {
  //     throw new customError("Cannot fetch attendance for a future month.", 400);
  //   }

  //   if (!enrollmentId) {
  //     throw new customError("Enrollment ID is required.", 400);
  //   }

  //   const startDate = requested.clone().startOf("month");
  //   const isCurrentMonth = requested.isSame(today, "month");
  //   const endDate = isCurrentMonth ? today : requested.clone().endOf("month");

  //   // ✅ Step 1: Fetch attendance data from Attendance table (NOT Enrollment table)
  //   const attendanceRecords = await Attendance.findAll({
  //   where: {
  //     student_enrollment_id: enrollmentId,
  //     attendance_date: {
  //       [Op.between]: [startDate.toDate(), endDate.toDate()],
  //     },
  //   },
  //   attributes: [
  //     'id',
  //     'student_enrollment_id',
  //     'status',
  //     'attendance_date',
  //     'in_time',
  //     'out_time',
  //     // ❌ removed 'enrollment_id'
  //   ],
  //   include: [
  //     {
  //       model: Student_Enrollment,
  //       // as: "Student_Enrollment",
  //       // include: [
  //       //   {
  //       //     model: Student,
  //       //     attributes: ["name", "enrollment_id"],
  //       //   },
  //       // ],
  //     },
  //   ],
  // });

  //   // ✅ Step 2: Create a map for quick lookup
  //   console.log('====================================');
  //   console.log(attendanceMap);
  //   console.log('====================================');
  //   const attendanceMap = {};
  //   attendanceRecords.forEach((record) => {
  //     const dateStr = moment(record.attendance_date).format("YYYY-MM-DD");
  //     attendanceMap[dateStr] = record;
  //   });

  //   // ✅ Step 3: Build full month data (excluding Sundays)
  //   const result = [];
  //   const currentDay = startDate.clone();
  //   const studentName = attendanceRecords[0]?.Student_Enrollment?.Student?.name || null;
  //   const studentEnrollmentId = enrollmentId;

  //   while (currentDay.isSameOrBefore(endDate, "day")) {
  //     const dateStr = currentDay.format("YYYY-MM-DD");

  //     if (currentDay.day() !== 0) {
  //       if (attendanceMap[dateStr]) {
  //         result.push(attendanceMap[dateStr]);
  //       } else {
  //         result.push({
  //           attendance_date: dateStr,
  //           status: "absent",
  //           in_time: null,
  //           out_time: null,
  //           Student_Enrollment: {
  //             student_enrollment_id: studentEnrollmentId,
  //             Student: {
  //               name: studentName,
  //             },
  //           },
  //         });
  //       }
  //     }

  //     currentDay.add(1, "day");
  //   }

  //   return result;
  // },

  // getStudentAttendance: async (enrollmentId, month, year) => {
  //   const today = moment().startOf("day");
  //   const requested = moment({ year, month: month - 1 }); // 0-indexed month

  //   if (requested.isAfter(today, "month")) {
  //     throw new customError("Cannot fetch attendance for a future month.", 400);
  //   }

  //   if (!enrollmentId) {
  //     throw new customError("Enrollment ID is required.", 400);
  //   }

  //   const startDate = requested.clone().startOf("month");
  //   const isCurrentMonth = requested.isSame(today, "month");
  //   const endDate = isCurrentMonth ? today : requested.clone().endOf("month");

  //   // ✅ Step 1: Fetch attendance data from Attendance table (NOT Enrollment table)
  //   const attendanceRecords = await Attendance.findAll({
  //   where: {
  //     student_enrollment_id: enrollmentId,
  //     attendance_date: {
  //       [Op.between]: [startDate.toDate(), endDate.toDate()],
  //     },
  //   },
  //   attributes: [
  //     'id',
  //     'student_enrollment_id',
  //     'status',
  //     'attendance_date',
  //     'in_time',
  //     'out_time',
  //   ],
  //   include: [
  //     {
  //       model: Student_Enrollment,
  //       as: "Student_Enrollment",
  //       include: [
  //         {
  //           model: Student,
  //           as: "Student", // ✅ NO alias here because none is defined
  //           attributes: ["name"],
  //         },
  //       ],
  //     },
  //   ],
  // });

  // const attendanceMap = {};
  //   // ✅ Step 2: Create a map for quick lookup
  //   console.log('====================================');
  //   console.log(attendanceMap);
  //   console.log('====================================');
  //   attendanceRecords.forEach((record) => {
  //     const dateStr = moment(record.attendance_date).format("YYYY-MM-DD");
  //     attendanceMap[dateStr] = record;
  //   });

  //   // ✅ Step 3: Build full month data (excluding Sundays)
  //   const result = [];
  //   const currentDay = startDate.clone();
  //   const studentName = attendanceRecords[0]?.Student_Enrollment?.Student?.name || null;
  //   const studentEnrollmentId = enrollmentId;

  //   while (currentDay.isSameOrBefore(endDate, "day")) {
  //     const dateStr = currentDay.format("YYYY-MM-DD");

  //     if (currentDay.day() !== 0) {
  //       if (attendanceMap[dateStr]) {
  //         result.push(attendanceMap[dateStr]);
  //       } else {
  //         result.push({
  //           attendance_date: dateStr,
  //           status: "absent",
  //           in_time: null,
  //           out_time: null,
  //           Student_Enrollment: {
  //             student_enrollment_id: studentEnrollmentId,
  //             Student: {
  //               name: studentName,
  //             },
  //           },
  //         });
  //       }
  //     }

  //     currentDay.add(1, "day");
  //   }

  //   return result;
  // },

  getStudentAttendance: async (enrollmentId, month, year) => {
    const today = moment().startOf("day");

    if (!enrollmentId) {
      throw new customError("Enrollment ID is required.", 400);
    }

    // Requested month (moment uses 0-based months)
    const requested = moment({ year, month: month - 1 }).startOf("month");

    if (requested.isAfter(today, "month")) {
      throw new customError("Cannot fetch attendance for a future month.", 400);
    }

    // ✅ Fetch enrollment
    const enrollment = await Student_Enrollment.findByPk(enrollmentId, {
      attributes: ["id", "joining_date"],
    });

    if (!enrollment) {
      throw new customError("Invalid enrollment ID.", 404);
    }

    const joiningDate = moment(enrollment.joining_date).startOf("day");

    // ✅ Prevent fetching before joining month
    if (requested.isBefore(joiningDate, "month")) {
      throw new customError(
        "Attendance for this student does not exist before joining date.",
        400
      );
    }

    // ✅ Date range (only till today if current month)
    const startDate = requested.clone().startOf("month");
    const endDate = requested.isSame(today, "month")
      ? today
      : requested.clone().endOf("month");

    // ✅ Fetch attendance records
    const attendanceRecords = await Attendance.findAll({
      where: {
        student_enrollment_id: enrollmentId,
        attendance_date: {
          [Op.between]: [startDate.toDate(), endDate.toDate()],
        },
      },
      attributes: [
        "id",
        "student_enrollment_id",
        "status",
        "attendance_date",
        "in_time",
        "out_time",
      ],
      include: [
        {
          model: Student_Enrollment,
          as: "Student_Enrollment", // must match defined association
          include: [
            {
              model: Student,
              as: "Student", // must match defined association
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // ✅ Convert to a quick lookup map
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [
        moment(record.attendance_date).format("YYYY-MM-DD"),
        record,
      ])
    );

    const studentName =
      attendanceRecords[0]?.Student_Enrollment?.Student?.name || null;

    // ✅ Build result for each valid day
    const result = [];
    let currentDay = startDate.clone();

    while (currentDay.isSameOrBefore(endDate, "day")) {
      if (currentDay.day() !== 0) {
        const dateStr = currentDay.format("YYYY-MM-DD");
        result.push(
          attendanceMap.get(dateStr) || {
            attendance_date: dateStr,
            status: "absent",
            in_time: null,
            out_time: null,
            Student_Enrollment: {
              id: enrollmentId,
              Student: {
                name: studentName,
              },
            },
          }
        );
      }
      currentDay.add(1, "day");
    }

    return result;
  },

  // getStudentAttendance: async (enrollmentId, month, year) => {
  //   // Validate future month/year
  //   const today = moment();
  //   const requested = moment({ year, month: month - 1 }); // moment month is 0-indexed

  //   if (requested.isAfter(today, 'month')) {
  //     throw new customError("Cannot fetch attendance for a future month.", 400);
  //   }

  //   // Validate enrollmentId
  //   if (!enrollmentId) {
  //     throw new customError("Enrollment ID is required.", 400);
  //   }

  //   // Start and end dates for the month
  //   const startDate = requested.startOf('month').toDate();
  //   const endDate = requested.endOf('month').toDate();

  //   // Fetch attendance records from DB for that month
  //   const attendanceData = await attendencerepositrie.model.findAll({
  //     where: {
  //       enrollment_id: enrollmentId,
  //       attendance_date: {
  //         [Op.between]: [startDate, endDate],
  //       },
  //     },
  //     order: [['attendance_date', 'ASC']],
  //     include: [
  //       {
  //         association: 'Student',
  //         attributes: ['name', 'enrollment_id'],
  //       },
  //     ],
  //   });

  //   // If no attendance data for month, generate absent for all days except Sundays
  //   if (attendanceData.length === 0) {
  //     const absentDays = [];
  //     let day = moment(startDate);
  //     const end = moment(endDate);

  //     while (day.isSameOrBefore(end, 'day')) {
  //       // Exclude Sundays (day() === 0 is Sunday)
  //       if (day.day() !== 0) {
  //         absentDays.push({
  //           attendance_date: day.format('YYYY-MM-DD'),
  //           status: 'absent',
  //           in_time: null,
  //           out_time: null,
  //           Student: {
  //             enrollment_id: enrollmentId,
  //             // name: null or fetch from student table if needed
  //           },
  //         });
  //       }
  //       day.add(1, 'day');
  //     }

  //     return absentDays;
  //   }

  //   // Return actual attendance data if exists
  //   return attendanceData;
  // },

  //   const fromDate = new Date(from);
  //   const toDate = new Date(to);

  //   const filteredData = await attendencerepositrie.getFilteredData({ fromDate, toDate, course_id, Batch_id });

  //   let studentData = [];
  //   // let batchdetails = [];
  //   if (Batch_id) {
  //     studentData = await studentRepository.findAll({ batch_id: Batch_id });
  //   }
  //   // else{
  //   //   batchdetails = batchesRepositorie.findAll({course_id:course_id})
  //   // }

  //   return {
  //     attendance: filteredData,
  //     students: studentData,
  //   };
  // }

  // exportdatainExcelServices: async ({ from, to, Batch_id }) => {
  //   const fromDate = new Date(from);
  //   const toDate = new Date(to);

  //   const filteredData = await attendencerepositrie.getFilteredData({
  //     fromDate,
  //     toDate,
  //     Batch_id,
  //   });
  //   console.log("user data  form excel data : ",filteredData)
  //   const allstudent = await studentRepository.findAll()
  //   const mapuse = allstudent.map((i)=>i.enrollment_id)

  //   return {
  //     data : filteredData,
  //   allstudent : mapuse
  // }

  //   // const workbook = new ExcelJS.Workbook();
  //   // const worksheet = workbook.addWorksheet("Attendance");

  //   // // Define Columns
  //   // worksheet.columns = [
  //   //   { header: "S.No", key: "s_no", width: 10 },
  //   //   { header: "Student Name", key: "name", width: 30 },
  //   //   { header: "Enrollment ID", key: "enrollment_id", width: 20 },
  //   //   { header: "Date", key: "attendance_date", width: 15 },
  //   //   { header: "Status", key: "status", width: 15 },
  //   //   { header: "In Time", key: "in_time", width: 15 },
  //   //   { header: "Out Time", key: "out_time", width: 15 },
  //   //   { header: "Batch Name", key: "batch_name", width: 25 },
  //   //   { header: "Course Name", key: "course_name", width: 25 },
  //   // ];

  //   // // Add rows
  //   // filteredData.forEach((item, index) => {
  //   //   worksheet.addRow({
  //   //     s_no: index + 1,
  //   //     name: item.Student?.name,
  //   //     enrollment_id: item.enrollment_id,
  //   //     attendance_date: item.attendance_date,
  //   //     status: item.status,
  //   //     in_time: item.in_time,
  //   //     out_time: item.out_time,
  //   //     batch_name: item.Student?.Batch?.BatchesName || "",
  //   //     course_name: item.Student?.Course?.course_name || "",
  //   //   });
  //   // });

  //   // // Export to buffer
  //   // const buffer = await workbook.xlsx.writeBuffer();
  //   // return  buffer

  // },
  exportdatainExcelServices: async ({ from, to, Batch_id }) => {
    if (!from || !to || !Batch_id) {
      throw new customError("Missing required fields: from, to, or Batch_id");
    }

    // ✅ Direct new Date use karo (YYYY-MM-DD handle ho jayega)
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999); // Include full 'to' day

    // ❌ Check invalid date
    if (isNaN(fromDate) || isNaN(toDate)) {
      throw new customError("Invalid date format for 'from' or 'to'");
    }

    if (fromDate > toDate) {
      throw new customError(
        "❌ Please make sure:\n- From Date is before To Date\n- To Date is not in the future"
      );
    }

    // ✅ Fetch Students
    const allStudents = await accessRepositori.getfundata(Batch_id);

    // ✅ Filter students by joining_date (agar required ho)
    const filteredStudents = allStudents.filter((student) => {
      const joiningDate = new Date(student.joining_date);
      return joiningDate >= fromDate && joiningDate <= toDate;
    });

    // ✅ Fetch Attendance
    const allAttendance = await attendencerepositrie.getFilteredData({
      fromDate,
      toDate,
      Batch_id,
    });

    const filtereddata = [];

    // ✅ Iterate each day between fromDate & toDate
    for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d.getTime());
      const dateStr = currentDate.toISOString().split("T")[0];

      const dayAttendance = allAttendance.filter((entry) => {
        const attDate = entry.attendance_date
          ? new Date(entry.attendance_date)
          : null;
        if (!attDate || isNaN(attDate)) return false;

        return attDate.toISOString().split("T")[0] === dateStr;
      });

      const attendedEnrollmentIds = dayAttendance.map(
        (a) => a.Student_Enrollment?.id || a.id
      );

      const absentEntries = allStudents
        .filter((student) => !attendedEnrollmentIds.includes(student.id))
        .map((student) => ({
          student_enrollment_id: student.id,
          name: student.Student?.name || "",
          in_time: "00:00:00",
          out_time: "00:00:00",
          status: "absent",
          attendance_date: dateStr,
          Student: {
            name: student.Student?.name || "",
            Batch: {
              BatchesName: student.Batch?.BatchesName || "",
            },
            Course: {
              course_name: student.Course?.course_name || "",
            },
          },
        }));

      filtereddata.push(...dayAttendance, ...absentEntries);
    }

    // ✅ Excel logic
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: "S.No", key: "s_no", width: 10 },
      { header: "Student Name", key: "name", width: 30 },
      { header: "Enrollment ID", key: "enrollment_id", width: 20 },
      { header: "Date", key: "attendance_date", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "In Time", key: "in_time", width: 15 },
      { header: "Out Time", key: "out_time", width: 15 },
      { header: "Batch Name", key: "batch_name", width: 25 },
      { header: "Course Name", key: "course_name", width: 25 },
    ];

    filtereddata.forEach((item, index) => {
      worksheet.addRow({
        s_no: index + 1,
        name: item.Student?.name || item.name || "",
        enrollment_id: item.student_enrollment_id || item.enrollment_id || "",
        attendance_date: item.attendance_date,
        status: item.status,
        in_time: item.in_time,
        out_time: item.out_time,
        batch_name: item.Student?.Batch?.BatchesName || "",
        course_name: item.Student?.Course?.course_name || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};

module.exports = attendanceservice;
