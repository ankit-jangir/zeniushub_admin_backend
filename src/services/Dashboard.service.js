const PDFDocument = require("pdfkit"); // Import Student model
// const getStream = await import('get-stream');
// const Department = require("../models/department");
// const { Op } = require("sequelize");
const { sessionRepositories } = require("../repositories/session.repo");
const sessionRepository = new sessionRepositories();
const { fn, col, literal, Op, where } = require("sequelize");
// const moment = require('moment/moment');
const {
  Employee, Student, Department, Batches, Emi, Attendance, Session, Subject, Course } = require("../models");
const moment = require("moment/moment");
// const dayjs = require("dayjs");
const customError = require("../utils/error.handler");
const {Student_Enrollment} = require("../models/index");
// async function loadGetStream() {
//   const getStream = await import("get-stream");
// }

// loadGetStream();

const DashboardService = {
  getEmployee: async (session_id) => {
    try {
      const allemploye = await Employee.findAndCountAll({ where: { status: "Active" } , attributes: {
        exclude: ["password", "account_number", "ifsc_code", "socket_id"]
      }});
      const Students = await Student_Enrollment.findAndCountAll(
      {  where:{
          session_id:session_id,
          status:true
        },
        // include:[
        //   model:student
        // ]
        
      }
      );
      return {
        allemploye,
        Students,
      };
    } catch (error) {
      console.error("❌ Error in getEmployee:", error.message);
      throw error;
    }
  },
  department: async () => {

    return Department.findAll();
  },
getEmiDataForSession: async (sessionId) => {
  // Service / Controller के अंदर
const sessionidfind = await Session.findOne({
  where: { id: sessionId }
});

if (!sessionId) {
  throw new Error("Session ID is required");
}


const emis = await Emi.findAll({
  include: [
    {
      model: Student_Enrollment,
      required: true,
      where:{
        session_id:sessionId
      },
      include: [
        {
          model: Student,
          required: true,
          where: { status: "active" },
        }
      ],
      include:[
        {
          model: Batches,
          required: true,
          where: {
            status: "active",
          },
          include: [
            {
              model: Course,
              required: true,
              where: { status: "active" },
            },
          ],
        },
      ]
    },
  ],
});
   

  if (!emis || emis.length === 0) {
    return {
      monthlyData: [],
      totalExpectedAmount: 0,
      totalReceivedAmount: 0,
    };
  }

  // Initialize monthly map
  const monthlyDataMap = Array.from({ length: 12 }, (_, i) => ({
    month: moment().month(i).format("MMMM"),
    totalExpectedAmount: 0,
    totalReceivedAmount: 0,
  }));

  let overallExpected = 0;
  let overallReceived = 0;

  emis.forEach((emi) => {
    // Expected (based on due date)
    if (emi.emi_duedate && emi.amount != null) {
      const dueMonthIndex = new Date(emi.emi_duedate).getMonth();
      monthlyDataMap[dueMonthIndex].totalExpectedAmount += emi.amount;
      overallExpected += emi.amount;
    }

    // Received (based on payment date)
    if (emi.payment_date && emi.amount != null && emi.due_amount != null) {
      const paidMonthIndex = new Date(emi.payment_date).getMonth();
      const received = emi.amount - emi.due_amount;
      if (received > 0) {
        monthlyDataMap[paidMonthIndex].totalReceivedAmount += received;
        overallReceived += received;
      }
    }
  });

  const filteredMonthlyData = monthlyDataMap.filter(
    (entry) => entry.totalExpectedAmount > 0 || entry.totalReceivedAmount > 0
  );

  return {
    monthlyData: filteredMonthlyData,
    totalExpectedAmount: overallExpected,
    totalReceivedAmount: overallReceived,
  };
}
,





  //   Emiservices: async () => {
  //     const emis = await Emi.findAll({
  //       include: [
  //         {
  //           model: Student,
  //           include: [
  //             {
  //               model: Batches,
  //               where: { Session_id: sessionId }
  //             },
  //           ],
  //         },
  //       ],
  //     });
  //     console.log("000", emis );

  //     const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
  //       month: new Date(0, i).toLocaleString("default", { month: "long" }),
  //       totalExpectedAmount: 0,
  //     }));

  //     for (const emi of emis) {
  //       const dueDate = new Date(emi.emi_duedate);
  //       const month = dueDate.getMonth();

  //       const student = emi.Student;
  //       const batch = student?.Batch;
  //       const session = batch?.Session;

  //       if (session) {
  //         const sessionStart = new Date(session.start_date);
  //         const sessionEnd = new Date(session.end_date);

  //         if (dueDate >= sessionStart && dueDate <= sessionEnd) {
  //           monthlyTotals[month].totalExpectedAmount += emi.amount || 0;
  //         }
  //       }
  //     }

  //     return {
  //       monthlyData: monthlyTotals,
  //     };
  //   },

  studentsAttendanceServices: async () => {
    const attendance = await Attendance.findAndCountAll({
      where: {
        status: {
          [Op.or]: ["present", "half day", "absent"],
        },
      },
    });
    let totalStudents = await Student.findAndCountAll({
      where: { status: "active" },
    });
    console.log("count  ", totalStudents);

    const summary = {}; // pehle ek object banayenge

    attendance.rows.forEach((record) => {
      const weekday = moment(record.attendance_date).format("dddd");

      if (
        weekday === "Sunday" ||
        moment(record.attendance_date).isSame(moment(), "day")
      )
        return;
      console.log("week  ", weekday);

      if (!summary[weekday]) {
        console.log(1);

        summary[weekday] = {
          totalAttendance: totalStudents.count,
          totalPresent: 0,
          totalHalfDay: 0,
        };
      }

      summary[weekday].totalAttendance = totalStudents.count;

      if (record.status === "present") {
        summary[weekday].totalPresent += 1;
      }

      if (record.status === "half day") {
        summary[weekday].totalHalfDay += 1;
      }
    });

    // Object ko Array me convert karenge
    const result = Object.entries(summary).map(([day, values]) => ({
      day,
      totalAttendance: values.totalAttendance,
      totalPresent: values.totalPresent,
      totalHalfDay: values.totalHalfDay,
    }));

    return {
      status: "success",
      data: result,
    };
  },

  reaaildata: async () => {
    // Step 1: Fetch active students from the database
    const students = await Student.findAndCountAll({
      where: { status: "active" },
    });

    const summary = {}; // Object to store attendance summary by day

    // Step 2: Loop through each student
    for (const student of students.rows) {
      // We assume student has attendance data in some relation, so we fetch the attendance for each student
      const attendance = await Attendance.findAll({
        where: {
          enrollment_id: student.enrollment_id,
          status: {
            [Op.or]: ["present", "half day", "absent"],
          },
        },
      });

      // Step 3: Loop through each attendance record of the student
      attendance.forEach((record) => {
        const weekday = moment(record.attendance_date).format("dddd");

        // Skip Sundays and today's date
        if (
          weekday === "Sunday" ||
          moment(record.attendance_date).isSame(moment(), "day")
        )
          return;

        // Initialize the summary for the day if it doesn't exist
        if (!summary[weekday]) {
          summary[weekday] = {
            totalAttendance: 0,
            totalPresent: 0,
            totalHalfDay: 0,
          };
        }

        // Increment the attendance counts based on the status
        summary[weekday].totalAttendance += 1;

        if (record.status === "present") {
          summary[weekday].totalPresent += 1;
        }

        if (record.status === "half day") {
          summary[weekday].totalHalfDay += 1;
        }
      });
    }

    // Step 4: Convert the summary object to an array of results
    const result = Object.entries(summary).map(([day, values]) => ({
      day,
      totalAttendance: values.totalAttendance,
      totalPresent: values.totalPresent,
      totalHalfDay: values.totalHalfDay,
    }));

    // Step 5: Return the final response
    return {
      status: "success",
      data: result,
    };
  },

  //     studentsAttendanceServices: async () => {

  //     const today = new Date();
  //     const sixDaysAgo = new Date();
  //     sixDaysAgo.setDate(today.getDate() - 6);

  //     const allAttendance = await Attendance.findAll({
  //         where: {
  //             status: {
  //                 [Op.or]: ["present", "half day"]
  //             },
  //             createdAt: {
  //                 [Op.between]: [sixDaysAgo, today]
  //             }
  //         }
  //     });

  //     // Filter out Sundays and prepare day-wise count
  //     const dayWiseCount = {};

  //     allAttendance.forEach(record => {
  //         const date = new Date(record.createdAt);
  //         const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  //         if (dayIndex !== 0) { // Skip Sunday
  //             const dayName = date.toLocaleString('en-US', { weekday: 'long' }); // e.g. "Monday"
  //             if (!dayWiseCount[dayName]) {
  //                 dayWiseCount[dayName] = 0;
  //             }
  //             dayWiseCount[dayName]++;
  //         }
  //     });

  //     return dayWiseCount;
  // }


    getCounts: async () => {
  const activeCoursesCount = await Course.count({ where: { status: 'active' } });
  const sessionsCount = await Session.count();  // No status filter here
  const subjectsCount = await Subject.count({ where: { status: 'active' } });
  const batchesCount = await Batches.count({ where: { status: 'active' } });

  return {
    status: 'success',
    data: {
      activeCoursesCount,
      sessionsCount,
      subjectsCount,
      batchesCount,
    },
  };
}


};

module.exports = DashboardService;