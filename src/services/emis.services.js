const { emisRepositories } = require("../repositories/emis.repo");
const emisRepositorie = new emisRepositories();
const { Op, fn, col, literal, sequelize } = require("sequelize");
// const { Op } = require("sequelize");
// const { sequelize, Op } = require("sequelize");
const moment = require("../utils/time-zone");
const { try_catch } = require("../utils/tryCatch.handler");
// const { Emi, Student, Batches, Course } = require("../models");
const { Student, Batches, Course, Emi, Student_Enrollment } = require("../models"); // Import from models
const customError = require("../utils/error.handler");
const { studentRepositories } = require("../repositories/student.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
const PaymentReceiptService = require("./receipt.service");
const { PaymentReceiptRepositories } = require("../repositories/receipt.repo");
const { mystuaccessRepositories } = require("../repositories/studentEmrollment.repo");
// const student_enrollment = require("../models/student_enrollment");
const batchesRepositorie = new batchesRepositories();
const studentRepository = new studentRepositories();
const coursesRepository = new CoursesRepositories();
const receiptRepository = new PaymentReceiptRepositories();
const accessRepositorie = new mystuaccessRepositories()

const Emiservices = {
  // addEmis: async ({
  //   student_id,
  //   discount_percentage = 0,
  //   emi_frequency, // ➜ now means “gap in months”
  // }) => {
  //   /* ---------- 1. Validate inputs --------------------------------------- */
  //   if (!student_id || !emi_frequency) {
  //     throw new customError("student_id and emi_frequency are required", 400);
  //   }
  //   if (emi_frequency <= 0) {
  //     throw new customError("emi_frequency (month gap) must be > 0", 400);
  //   }
  //   if (discount_percentage < 0 || discount_percentage > 100) {
  //     throw new customError(
  //       "discount_percentage must be between 0 and 100",
  //       400
  //     );
  //   }

  //   /* ---------- 2. Fetch student & sanity checks -------------------------- */
  //   const student = await studentRepository.getDataById(student_id);
  //   if (!student) throw new customError("Student not found", 404);
  //   if (student.status === "inactive") {
  //     throw new customError("Inactive student cannot add EMI", 400);
  //   }

  //   const duplicate = await emisRepositorie.findOne({ student_id });
  //   if (duplicate)
  //     throw new customError("EMI plan already exists for this student", 409);

  //   /* ---------- 3. Course price / duration ------------------------------- */
  //   const course = await coursesRepository.getDataById(student.course_id);
  //   if (!course)
  //     throw new customError("Course linked to student not found", 404);

  //   const coursePrice = Number(course.course_price);
  //   const courseDuration = Number(course.course_duration); // months

  //   /* ---------- 4. Amount calculations ----------------------------------- */
  //   const discountAmount = Math.round(
  //     (coursePrice * discount_percentage) / 100
  //   );
  //   const finalAmount = coursePrice - discountAmount;

  //   /* ---------- 5. Build EMI schedule ------------------------------------ */
  //   const startDate = new Date(student.joining_date);
  //   const endDate = new Date(startDate);
  //   endDate.setMonth(endDate.getMonth() + courseDuration);

  //   // Helper to keep same‐or‐last day of month
  //   const addMonthsKeepingDay = (baseDate, monthsToAdd) => {
  //     const d = baseDate.getDate();
  //     const newDate = new Date(baseDate);
  //     newDate.setDate(1); // avoid overflow
  //     newDate.setMonth(newDate.getMonth() + monthsToAdd);
  //     const lastDay = new Date(
  //       newDate.getFullYear(),
  //       newDate.getMonth() + 1,
  //       0
  //     ).getDate();
  //     newDate.setDate(Math.min(d, lastDay));
  //     return newDate;
  //   };

  //   // Build the list of due-dates using the gap in months
  //   const dueDates = [];
  //   for (let due = new Date(startDate); due <= endDate; ) {
  //     dueDates.push(new Date(due));
  //     due = addMonthsKeepingDay(due, emi_frequency);
  //   }

  //   const emiCount = dueDates.length;

  //   /* ---------- 6. Split amount across EMIs ------------------------------ */
  //   const baseAmt = Math.floor(finalAmount / emiCount);
  //   const remainder = finalAmount - baseAmt * emiCount;

  //   const emiList = [];

  //   for (let i = 0; i < emiCount; i++) {
  //     const amountForThisEmi = baseAmt + (i === emiCount - 1 ? remainder : 0);

  //     const emiRecord = await emisRepositorie.create({
  //       student_id,
  //       amount: amountForThisEmi,
  //       is_paid: false,
  //       payment_date: null,
  //       emi_duedate: emiDueDate,
  //       due_amount: emiAmount,
  //     });
  //     // return emiData
  //     const createdEmi = await emisRepositorie.create(emiData);
  //     emiList.push(createdEmi);
  //   }

  //   /* ---------- 7. Update student totals --------------------------------- */
  //   await studentRepository.update(
  //     {
  //       count_emi: emiCount,
  //       discount_amount: discountAmount,
  //       final_amount: finalAmount,
  //     },
  //     { id: student_id }
  //   );

  //   return emiList;
  // },
  // services/emi.services.js





  addEmis: async ({
    enrollment_id,
    discount_percentage = 0,
    emi_frequency, // gap in months
  }) => {
    /* ---------- 1. Basic input checks ---------------------------------- */
    if (!enrollment_id || !emi_frequency) {
      throw new customError("student_id and emi_frequency are required", 400);
    }
    if (emi_frequency <= 0) {
      throw new customError("emi_frequency (month gap) must be > 0", 400);
    }
    if (discount_percentage < 0 || discount_percentage > 100) {
      throw new customError(
        "discount_percentage must be between 0 and 100",
        400
      );
    }

    const student = await accessRepositorie.getOneData({ student_id: enrollment_id });
if (!student) throw new customError("Student not found", 404);

const id = student.id; // ✅ enrollment id
const studetndetails = await studentRepository.getDataById(id);

if (!studetndetails.joining_date) {
  throw new customError("Student joining_date is missing", 400);
}
const startDate = new Date(studetndetails.joining_date);
if (Number.isNaN(startDate.getTime())) {
  throw new customError("Invalid joining_date format", 400);
}

    // const data = student.Student?.enrollment_id
    console.log('====================================');
    console.log(student);
    console.log('====================================');
    const data = student.id;
    console.log("********************before duplicate ***********")
    const duplicate = await emisRepositorie.findOne({ enrollment_id: data });
    console.log("********************after duplicate ***********")

    if (duplicate) {
      throw new customError("EMI plan already exists for this student", 409);
    }
    console.log("I am data 1 : ");

    /* ---------- 3. Fetch & validate course ----------------------------- */
    const course = await coursesRepository.getDataById(student.course_id);
    console.log('====================================');
    console.log("I am data 2 : ");
    console.log('====================================');
    if (!course)
      throw new customError("Course linked to student not found", 404);

    const coursePrice = Number(course.course_price);
    const courseDuration = Number(course.course_duration); // months
    if (!courseDuration || courseDuration <= 0) {
      throw new customError("Course duration must be > 0 months", 400);
    }

    /* ---------- 4. Amount calculations --------------------------------- */
    const discountAmount = Math.round(
      (coursePrice * discount_percentage) / 100
    );
    const finalAmount = coursePrice - discountAmount;

    /* ---------- 5. Build EMI schedule ---------------------------------- */
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + courseDuration);

    // helper that keeps “same-or-last” day of month
    const addMonthsKeepingDay = (base, months) => {
      const d = base.getDate();
      const n = new Date(base);
      n.setDate(1);
      n.setMonth(n.getMonth() + months);
      const lastDay = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      n.setDate(Math.min(d, lastDay));
      return n;
    };

    const dueDates = [];
    for (let due = new Date(startDate); due < endDate;) {
      dueDates.push(new Date(due));
      due = addMonthsKeepingDay(due, emi_frequency);
    }

    if (dueDates.length === 0) {
      throw new customError("Could not build any EMI due dates", 500);
    }

    /* ---------- 6. Split amount across EMIs ---------------------------- */
    const emiCount = dueDates.length;
    const baseAmt = Math.floor(finalAmount / emiCount);
    const remainder = finalAmount - baseAmt * emiCount;

    /* ---------- 7. Create EMI rows ------------------------------------- */
    const emiList = [];
    for (let i = 0; i < emiCount; i++) {
      const amountForThisEmi = baseAmt + (i === emiCount - 1 ? remainder : 0);

      const emiRecord = await emisRepositorie.create({
        enrollment_id: data,
        amount: amountForThisEmi,
        is_paid: false,
        payment_date: null,
        emi_duedate: dueDates[i],
        due_amount: amountForThisEmi,
      });

      emiList.push(emiRecord);
    }

    /* ---------- 8. Update student totals ------------------------------- */
    await accessRepositorie.update(
      {
        number_of_emi: emiCount,
        discount_amount: discountAmount,
        fees: finalAmount,
      },
      { id: data }
    );

    /* ---------- 9. Return result --------------------------------------- */
    return emiList;
  },


  /* -------------------------------------------------------------------------- */
  /*  ONE-SHOT EMI  (amount comes from course price, discount is %)             */
  /* -------------------------------------------------------------------------- */
  addOneShotEmi: async ({
  student_id,
  discount_percentage = 0,
  emi_duedate,
}) => {
  student_id = Number(student_id);
  console.log(
    {
      student_id,
      discount_percentage,
      emi_duedate,
    },
    "data   "
  );

  /* ---------- 1. Basic input checks ------------------------------------ */
  if (!student_id || !emi_duedate) {
    throw new customError("student_id and emi_duedate are required", 400);
  }
  if (discount_percentage < 0 || discount_percentage > 100) {
    throw new customError("discount_percentage must be 0-100", 400);
  }

  /* ---------- 2. Duplicate plan check ---------------------------------- */
  const duplicate = await emisRepositorie.findOne({ enrollment_id: student_id });
  if (duplicate)
    throw new customError("EMI plan already exists for this student", 409);

  /* ---------- 3. Student sanity checks --------------------------------- */
  const unduplicate = await accessRepositorie.findOne({ id: student_id });
  const student = await studentRepository.findOne({ id: unduplicate.student_id });
  if (!student) throw new customError("Student not found", 404);
  if (unduplicate.status === false)
    throw new customError("Inactive student cannot add EMI", 400);

  /* ---------- 4. Course duration validation ----------------------------- */
  const course = await coursesRepository.getDataById(unduplicate.course_id);
  if (!course)
    throw new customError("Course linked to student not found", 404);

  const joiningDate = new Date(
    unduplicate.joining_date || student.joining_date
  );
  if (!joiningDate)
    throw new customError("Student joining date not found", 400);

  const dueDate = new Date(emi_duedate);

  // course_duration is in months
  let courseEndDate = new Date(joiningDate);
  courseEndDate.setMonth(courseEndDate.getMonth() + Number(course.course_duration));

  // Validation: dueDate must be between joiningDate and courseEndDate
  if (dueDate < joiningDate) {
    throw new customError("EMI due date cannot be before joining date", 400);
  }
  if (dueDate > courseEndDate) {
    throw new customError("EMI due date cannot be after course end date", 400);
  }

  /* ---------- 5. Course price & discount ------------------------------- */
  const coursePrice = Number(course.course_price);
  const discountAmt = Math.round((coursePrice * discount_percentage) / 100);
  const netAmount = coursePrice - discountAmt;

  /* ---------- 6. Create EMI record ------------------------------------- */
  const emiRecord = await emisRepositorie.create({
    enrollment_id: student_id,
    amount: netAmount,
    due_amount: netAmount,
    is_paid: false,
    payment_date: null,
    emi_duedate: dueDate,
  });

  /* ---------- 7. Update student totals --------------------------------- */
  await accessRepositorie.update(
    {
      number_of_emi: 1,
      discount_amount: discountAmt,
      fees: netAmount,
    },
    { id: student_id }
  );

  return emiRecord;
},


  getEmis: async ({ query }) => {
    const month = parseInt(query.month, 10);
    const year = parseInt(query.year, 10);
    const filter = query.filter?.toLowerCase();

    const allEmis = await emisRepositorie.getData();

    const filteredEmis = allEmis.filter((emi) => {
      if (!emi?.emi_duedate) return false;

      const dueDate = new Date(emi.emi_duedate);
      return (
        dueDate instanceof Date &&
        !isNaN(dueDate) &&
        dueDate.getMonth() === month &&
        dueDate.getFullYear() === year
      );
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalMissed = 0;
    let totalPaid = 0;
    let totalUpcoming = 0;

    const missedEmis = [];
    const paidEmis = [];
    const upcomingEmis = [];

    filteredEmis.forEach((emi) => {
      const dueDate = new Date(emi.emi_duedate);
      dueDate.setHours(0, 0, 0, 0);
      const amount = parseFloat(emi.amount) || 0;

      if (emi.is_paid) {
        totalPaid += amount;
        paidEmis.push(emi);
      } else if (dueDate < today) {
        totalMissed += amount;
        missedEmis.push(emi);
      } else {
        totalUpcoming += amount;
        upcomingEmis.push(emi);
      }
    });

    let resultEmis;
    switch (filter) {
      case "paid":
        resultEmis = paidEmis;
        break;
      case "missed":
        resultEmis = missedEmis;
        break;
      case "upcoming":
        resultEmis = upcomingEmis;
        break;
      default:
        resultEmis = [...paidEmis, ...missedEmis, ...upcomingEmis];
    }

    return {
      summary: {
        totalMissedFees: totalMissed,
        totalCollectedFees: totalPaid,
        totalUpcomingFees: totalUpcoming,
        totalEmis: filteredEmis.length,
      },
      // details: resultEmis,
    };
  },









  // getEmisTotalAmounts: async (req) => {
  //   async function formatDateToSQL(date) {
  //     return date
  //       .toISOString()
  //       .replace("T", " ")
  //       .replace(/\.\d{3}Z$/, "+00");
  //   }

  //   if (!req || !req.query) {
  //     throw new customError("Invalid request object");
  //   }





  
  //   const month = parseInt(req.query.month, 10);
  //   const year = parseInt(req.query.year, 10);

  //   if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
  //     throw new customError("Valid month (1-12) and year are required");
  //   }

  //   const startDate = new Date(Date.UTC(year, month - 1, 1));
  //   const endDate = new Date(Date.UTC(year, month, 1));

  //   const formattedStartDate = await formatDateToSQL(startDate);
  //   const formattedEndDate = await formatDateToSQL(endDate);
  //   const todayStart = moment().startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
  //   console.log("formattedStartDate,formattedEndDate");
  //   console.log(formattedStartDate, formattedEndDate);

  //   const result = await emisRepositorie.model.findAll({
  //     attributes: [
  //       [
  //         fn(
  //           "SUM",
  //           literal(`CASE 
  //       WHEN payment_date >= '${formattedStartDate}' 
  //         AND payment_date < '${formattedEndDate}' 
  //       THEN (amount - due_amount) ELSE 0 END`)
  //         ),
  //         "totalPaid",
  //       ],
  //       [
  //         fn(
  //           "SUM",
  //           literal(`CASE 
  //       WHEN due_amount > 0 
  //         AND emi_duedate >= '${formattedStartDate}' 
  //         AND emi_duedate < '${formattedEndDate}' 
  //         AND emi_duedate < '${todayStart}' 
  //       THEN due_amount ELSE 0 END`)
  //         ),
  //         "totalMissed",
  //       ],
  //       [
  //         fn(
  //           "SUM",
  //           literal(`CASE 
  //       WHEN due_amount > 0 
  //         AND emi_duedate >= '${formattedStartDate}' 
  //         AND emi_duedate < '${formattedEndDate}' 
  //         AND emi_duedate >= '${todayStart}' 
  //       THEN due_amount ELSE 0 END`)
  //         ),
  //         "totalUpcoming",
  //       ],
  //       [fn("COUNT", col("Emi.id")), "totalEmis"],
  //     ],
  //     include: [
  //       {
  //         model: Student_Enrollment,
  //         attributes: [],
  //         required: true,
  //         include: [
  //           {
  //             model: Student,
  //             attributes: [],
  //             // where: { status: "active" },
  //             required: true,
  //           },
  //         ],
  //       },
  //     ],
  //     raw: true,
  //   });


  //   const { totalPaid, totalMissed, totalUpcoming, totalEmis } = result[0];

  //   const totalAmount =
  //     parseFloat(totalPaid || 0) +
  //     parseFloat(totalMissed || 0) +
  //     parseFloat(totalUpcoming || 0);

  //   return {
  //     totalAmount,
  //     breakdown: {
  //       totalCollectedFees: parseFloat(totalPaid || 0),
  //       totalMissedFees: parseFloat(totalMissed || 0),
  //       totalUpcomingFees: parseFloat(totalUpcoming || 0),
  //       totalEmis: parseInt(totalEmis || 0),
  //     },
  //   };
  // },














  getEmisTotalAmounts: async (req) => {
    if (!req || !req.query) {
      throw new customError("Invalid request object");
    }

    const { month, year, status } = req.query;

    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      throw new customError("Valid month (1-12) and year are required");
    }

    const startDate = new Date(Date.UTC(yearInt, monthInt - 1, 1));
    const endDate = new Date(Date.UTC(yearInt, monthInt, 1));
    const todayStart = moment().startOf("day").toDate();

    const whereClause = {
      [Op.or]: [
        { payment_date: { [Op.between]: [startDate, endDate] } },
        { emi_duedate: { [Op.between]: [startDate, endDate] } },
      ],
    };

    // ✅ Filter by status if given
    if (status === "paid") {
      whereClause.is_paid = true;
      whereClause.due_amount = 0;
    } else if (status === "upcoming") {
      whereClause.due_amount = { [Op.gt]: 0 };
      whereClause.emi_duedate = {
        [Op.and]: [
          { [Op.between]: [startDate, endDate] },
          { [Op.gte]: todayStart },
        ],
      };
    } else if (status === "missed") {
      whereClause.due_amount = { [Op.gt]: 0 };
      whereClause.emi_duedate = {
        [Op.and]: [
          { [Op.between]: [startDate, endDate] },
          { [Op.lt]: todayStart },
        ],
      };
    }

    // ✅ Fetch EMIs
    const emis = await Emi.findAll({ where: whereClause });

    let totalPaid = 0;
    let totalMissed = 0;
    let totalUpcoming = 0;

    emis.forEach((emi) => {
      const paymentDate = emi.payment_date ? new Date(emi.payment_date) : null;
      const dueDate = emi.emi_duedate ? new Date(emi.emi_duedate) : null;

      if (paymentDate && paymentDate >= startDate && paymentDate < endDate) {
        totalPaid += (emi.amount || 0) - (emi.due_amount || 0);
      }

      if (
        emi.due_amount > 0 &&
        dueDate &&
        dueDate >= startDate &&
        dueDate < endDate &&
        dueDate < todayStart
      ) {
        totalMissed += emi.due_amount;
      }

      if (
        emi.due_amount > 0 &&
        dueDate &&
        dueDate >= startDate &&
        dueDate < endDate &&
        dueDate >= todayStart
      ) {
        totalUpcoming += emi.due_amount;
      }
    });

    const totalAmount = totalPaid + totalMissed + totalUpcoming;

    return {
      totalAmount,
      breakdown: {
        totalCollectedFees: totalPaid,
        totalMissedFees: totalMissed,
        totalUpcomingFees: totalUpcoming,
        totalEmis: emis.length,
      },
    };
  },




















  markEmiAsPaid: async (emiId, isPaid) => {
    const newPaymentDate = isPaid ? new Date() : null;

    let emi = await emisRepositorie.getDataById(emiId);
    if (emi.is_paid) {
      throw new customError("emi already paid", 400)
    }

    let studentData = await studentRepository.getDataById(emi.student_id);
    console.log("data  ", studentData);
    return
    let data = {
      id: studentData.id,
      name: studentData.name,
      enrollment_id: studentData.enrollment_id,
      course_name: studentData.course?.course_name,
      amount: Number(emi.amount),
      emi_id: emi.id,
      paymentDate: (emi.payment_date ?? new Date()).toISOString().split("T")[0], // YYYY-MM-DD
    }
    let x = await PaymentReceiptService.createReceipt(emi, studentData)






    const [updatedCount] = await emisRepositorie.update(
      { is_paid: true, payment_date: newPaymentDate, },
      { id: emiId }
    );



    return updatedCount;
  },
  // getOneStudentPaymenthistory: async (id) => {
  //   const data = await Emi.findAll({
  //     where: { student_id: id },
  //     order: [['emi_duedate', 'ASC']], // descending order
  //   });

  //   if (!data.length) {
  //     throw new customError("No EMI's found", 400);
  //   }

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // Strip time for accurate date comparison

  //   const emiStatuses = data.map((emi) => {
  //     const dueDate = new Date(emi.emi_duedate);
  //     let status;

  //     if (!emi.due_amount || emi.due_amount === 0) {
  //       status = "paid";
  //     } else if (dueDate < today) {
  //       status = "missed";
  //     } else {
  //       status = "upcoming";
  //     }

  //     return {
  //       id: emi.id,
  //       amount: emi.amount,
  //       due_amount: emi.due_amount,
  //       emi_duedate: emi.emi_duedate,
  //       payment_date: emi.payment_date,
  //       status,
  //     };
  //   });

  //   return emiStatuses;
  // },







  getOneStudentPaymenthistory: async (id) => {
    const data = await accessRepositorie.OneStudentPayment(id);
    console.log("useer data : ", data)

    if (!data.length) {
      throw new customError("No EMI's found", 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Strip time

    // ✅ Loop inside Student_Enrollment and then Emis
    const emiStatuses = data.flatMap((enrollment) =>
      enrollment.Emis.map((emi) => {
        const dueDate = new Date(emi.emi_duedate);
        let status;

        if (!emi.due_amount || emi.due_amount === 0) {
          status = "paid";
        } else if (dueDate < today) {
          status = "missed";
        } else {
          status = "upcoming";
        }

        return {
          id: emi.id,
          amount: emi.amount,
          due_amount: emi.due_amount,
          emi_duedate: emi.emi_duedate,
          payment_date: emi.payment_date,
          status,
        };
      })
    );

    return emiStatuses;
  }
  ,













































































  // getFilteredEmis: async ({ status, fromDate, toDate }) => {
  //   console.log(status, fromDate, toDate);

  //   const start = moment(fromDate, "YYYY-MM-DD");
  //   const end = moment(toDate, "YYYY-MM-DD");

  //   if (!start.isValid() || !end.isValid()) {
  //     return { success: false, message: "Invalid date format" };
  //   }

  //   const emis = await emisRepositorie.getFilteredEmiskaran({
  //     fromDate,
  //     toDate,
  //     status,
  //   });

  //   if (!emis || emis.length === 0) {
  //     return {
  //       success: false,
  //       message: `No ${status} EMIs found for selected date range`,
  //     };
  //   }

  //   return { success: true, data: emis };
  // },

  getFilteredEmis: async ({
    status,
    fromDate,
    toDate,
    courseId,
    batchId,
    sessionid,
    page = 1,
    limit = 10,
  }) => {


    console.log(fromDate, " and : ", toDate)
    // const start = moment(fromDate, "YYYY-MM-DD");
    // const end = moment(toDate, "YYYY-MM-DD");

    // if (!start.isValid() || !end.isValid()) {
    //   return { success: false, message: "Invalid date format" };
    // }

    // const offset = (page - 1) * limit;

    const { rows: emis, count: total } =
      await emisRepositorie.getFilteredEmiskaran({
        fromDate,
        toDate,
        status,
        courseId,
        batchId,
        sessionid,
        page,
        limit,
      });

    if (!emis || emis.length === 0) {
      return {
        success: false,
        message: `No ${status} EMIs found for selected filters`,
      };
    }

    return {
      success: true,
      data: emis,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getFilteredEmisExcel: async ({
    status,
    fromDate,
    toDate,
    batchId,
    courseId,
  }) => {
    return await emisRepositorie.downloadGetFilteredEmiskaran({
      status,
      fromDate,
      toDate,
      batchId,
      courseId,
    });
  },

  getBatchSummary: async () => {
    const batches = await Batches.findAll({
      attributes: ["id", "batch_name"],
      include: [
        {
          model: Student,
          attributes: [],
        },
      ],
      group: ["Batches.id"],
      raw: true,
    });

    // Add student count and amount (if amount is calculated per student)
    const enriched = await Promise.all(
      batches.map(async (batch) => {
        const count = await Student.count({ where: { batch_id: batch.id } });
        const amount = count * 200; // Example fixed amount logic

        return {
          id: batch.id,
          batch_name: batch.batch_name,
          student_count: count,
          amount: `₹${amount.toLocaleString()}`,
        };
      })
    );

    return enriched;
  },

  // getEmiSummary: async ({ status, fromDate, toDate, batchId, page, limit }) => {
  //   const from = new Date(fromDate);
  //   const to = new Date(toDate);
  //   const today = new Date();

  getEmiSummary: async ({ status, fromDate, toDate, batchId, courseId }) => {
    const where = {};

    // Filter by status
    if (status === "paid") where.is_paid = true;
    else if (status === "missed") where.is_paid = false;

    // Filter by date
    if (fromDate && toDate) {
      where.emi_duedate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    // Optional batchId
    if (batchId) where.batch_id = batchId;

    // Student include logic
    const studentInclude = {
      model: Student,
      required: true,
      attributes: ["id", "name", "course_id", "batch_id"],
      where: {},
      include: [
        {
          model: Course,
          attributes: ["id", "course_name"],
          required: false,
        },
      ],
    };

    // Optional courseId
    if (courseId) {
      studentInclude.where.course_id = courseId;
    }

    // Call to repo
    return await emisRepositorie.getFilteredEmiskaran({
      where,
      include: [
        studentInclude,
        {
          model: Batches,
          attributes: ["id", "BatchesName"],
          required: false,
        },
      ],
    });
  },

  // emiDasboard:async()=>{
  //   const data = await emisRepositorie.getData()
  //   return data
  // }
  emiDasboard: async () => {
    const data = await emisRepositorie.getData();

    const today = new Date();

    let totalAmount = 0;
    let totalPaid = 0;
    let totalUpcoming = 0;
    let totalMissed = 0;

    data.forEach((entry) => {
      const amount = entry.amount || 0;
      totalAmount += amount;

      if (entry.is_paid) {
        totalPaid += amount;
      } else {
        const dueDate = new Date(entry.emi_duedate);
        if (dueDate > today) {
          totalUpcoming += amount;
        } else {
          totalMissed += amount;
        }
      }
    });

    return {
      totalAmount,
      totalPaid,
      totalUpcoming,
      totalMissed,
    };
  },
  getEmiSummaryByDate: async () => {
    const today = moment().startOf("day");
    const startOfDay = today.toDate();

    // Get current day at 23:59:59.999
    const endOfDay = moment().endOf("day").toDate();
    console.log(startOfDay, endOfDay);

    const emis = await emisRepositorie.getEmisByDate(startOfDay, endOfDay);

    // const totalExpected = emis.reduce((sum, e) => sum + Number(e.amount), 0);
    // const totalReceived = emis
    //   .filter((e) => e.is_paid)
    //   .reduce((sum, e) => sum + Number(e.amount), 0);
    // const toCollect = totalExpected - totalReceived;

    return {
      success: true,
      date: today.format("YYYY-MM-DD"),
      data: emis,
    };
  },
  getEmiSummary: async ({
    status,
    fromDate,
    toDate,
    batchId,
    courseId,
    page,
    limit,
  }) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date();

    const offset = (page - 1) * limit;

    let whereClause = {
      emi_duedate: {
        [Op.between]: [from, to],
      },
    };

    if (status === "paid") {
      whereClause.is_paid = true;
    } else if (status === "missed") {
      whereClause.is_paid = false;
      whereClause.emi_duedate = {
        [Op.and]: [{ [Op.between]: [from, to] }, { [Op.lt]: today }],
      };
    } else if (status === "upcoming") {
      whereClause.is_paid = false;
      whereClause.emi_duedate = {
        [Op.and]: [{ [Op.between]: [from, to] }, { [Op.gt]: today }],
      };
    }

    const studentWhere = {};
    if (batchId) studentWhere.batch_id = batchId;
    if (courseId) studentWhere.course_id = courseId;

    const result = await emisRepositorie.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      include: [
        {
          model: Student,
          where: studentWhere,
          required: true,
          attributes: ["id", "name", "course_id"],
          include: [
            {
              model: Batches,
              as: "Batch",
              attributes: ["id", "BatchesName"],
            },
          ],
        },
      ],
      order: [["emi_duedate", "ASC"]],
    });

    return {
      total: result.count,
      currentPage: page,
      totalPages: Math.ceil(result.count / limit),
      rows: result.rows,
    };
  },
  //   updateEmiPayment: async (emi_id, payment_date) => { 

  //     const emi = await emisRepositorie.getDataById(emi_id);

  //     if (!emi) {
  //       throw new customError("EMI not found");
  //     } 
  //     if (emi.is_paid) {
  //       throw new customError("emi already paid", 400)
  //     }

  // console.log('====================================');
  // console.log(emi);
  // console.log('====================================');

  //     const unpaidPreviousEmis = await emisRepositorie.findAll({

  //       student_id: emi.student_id,  
  //       is_paid: false,
  //       emi_duedate: {
  //         [Op.lt]: emi.emi_duedate,
  //       },  
  //     });
  //     console.log("vv  ", unpaidPreviousEmis); 
  //     if (unpaidPreviousEmis.length > 0) {
  //       throw new customError(
  //         "You must pay earlier EMIs before paying this one."
  //       );
  //     };
  //     await receiptRepository.create({ student_id: emi.student_id, amount: emi.due_amount, payment_date: payment_date })

  //     return await emisRepositorie.update(
  //       { payment_date: payment_date, is_paid: true, due_amount: 0 },
  //       { id: emi_id }
  //     );
  //   },
  updateEmiPayment: async (emi_id, payment_date) => {

    // 1. Get EMI by ID
    const emi = await emisRepositorie.getDataById(emi_id);
    console.log('====================================');
    console.log(emi);
    console.log('====================================');
    if (!emi) {
      throw new customError("EMI not found");
    }

    if (emi.is_paid) {
      throw new customError("EMI already paid", 400);
    }

    console.log('====================================');
    console.log(emi);
    console.log('====================================');

    // 2. Get all unpaid EMIs for this student before current EMI's due date
    const unpaidPreviousEmis = await emisRepositorie.findAll({
      enrollment_id: emi.enrollment_id,   // same student enrollment
      is_paid: false,
      emi_duedate: {
        [Op.lt]: emi.emi_duedate,        // due date before current EMI
      },

    });

    // 3. If any unpaid previous EMI exists, throw error
    if (unpaidPreviousEmis.length > 0) {
      throw new customError("You must pay earlier EMIs before paying this one.");
    }

    // 4. Create receipt for payment
    await receiptRepository.create({
      student_id: emi.enrollment_id,   // use enrollment_id as student_id if your schema follows this
      amount: emi.due_amount,
      payment_date: payment_date,
    });

    // 5. Update EMI as paid

    return await emisRepositorie.update(
      { payment_date: payment_date, is_paid: true, due_amount: 0 },
      { id: emi_id }
    );



  }
  ,


  emiAmountCheck: async (id, amount, payment_date) => {
    if (typeof id !== "number") {
      throw new customError(`Expected student_id as number, got ${typeof id}`);
    }

    let remainingAmount = amount;
    const messages = [];

    const allEmis = await emisRepositorie.findAll({
      student_id: id,
    });
    console.log("allEmis : :", allEmis);

    const sortedEmis = allEmis.sort(
      (a, b) => new Date(a.emi_duedate) - new Date(b.emi_duedate)
    );

    // ✅ Step 1: Process partial EMIs first
    for (let emi of sortedEmis) {
      if (emi.is_paid || emi.due_amount === 0) continue;

      if (remainingAmount === 0) break;

      if (remainingAmount >= emi.due_amount) {
        await emisRepositorie.model.update(
          {
            is_paid: true,
            payment_date: payment_date,
            due_amount: 0,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} remaining due ₹${emi.due_amount} fully cleared.`
        );
        remainingAmount -= emi.due_amount;
      } else {
        const updatedDue = emi.due_amount - remainingAmount;
        await emisRepositorie.model.update(
          {
            is_paid: false,
            payment_date: payment_date,
            due_amount: updatedDue,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} partially paid. ₹${remainingAmount} deducted, ₹${updatedDue} still due.`
        );
        remainingAmount = 0;
      }
    }

    // ✅ Step 2: Process unpaid EMIs
    for (let emi of sortedEmis) {
      if (emi.is_paid || emi.due_amount > 0) continue;

      if (remainingAmount === 0) break;

      if (remainingAmount >= emi.amount) {
        await emisRepositorie.model.update(
          {
            is_paid: true,
            payment_date: payment_date,
            due_amount: 0,
          },
          { where: { id: emi.id } }
        );
        messages.push(`EMI ID ${emi.id} fully paid. ₹${emi.amount} deducted.`);
        remainingAmount -= emi.amount;
      } else {
        const due = emi.amount - remainingAmount;
        await emisRepositorie.model.update(
          {
            is_paid: false,
            payment_date: payment_date,
            due_amount: due,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} partially paid. ₹${remainingAmount} deducted, ₹${due} due.`
        );
        remainingAmount = 0;
      }
    }

    return {
      success: true,
      message: "EMI payment processing completed",
      leftOverAmount: remainingAmount,
      details: messages,
    };
  },
  previewEmiPlan: async ({ student_id, discount_percentage = 0, emi_frequency }) => {
    if (!student_id || !emi_frequency) {
      throw new customError("student_id and emi_frequency are required", 400);
    }
    if (emi_frequency <= 0) {
      throw new customError("emi_frequency (month gap) must be > 0", 400);
    }
    if (discount_percentage < 0 || discount_percentage > 100) {
      throw new customError("discount_percentage must be between 0 and 100", 400);
    }

    console.log(student_id, "*ssssssssssssssss")
    const student = await studentRepository.getDataById(student_id);
    console.log(student, "**************************** student")
    if (!student) throw new customError("Student not found", 404);
    if (student.status === "inactive") {
      throw new customError("Inactive student cannot preview EMI", 400);
    }

    if (!student.joining_date) {
      throw new customError("Student joining_date is missing", 400);
    }

    const course = await coursesRepository.getDataById(student.course_id);
    if (!course) throw new customError("Course linked to student not found", 404);

    const coursePrice = Number(course.course_price);
    const courseDuration = Number(course.course_duration); // months
    if (emi_frequency > courseDuration) {
      throw new customError(
        `EMI frequency (${emi_frequency} months) cannot be greater than course duration (${courseDuration} months)`,
        400
      );
    }


    const discountAmount = Math.round((coursePrice * discount_percentage) / 100);
    const finalAmount = coursePrice - discountAmount;

    const startDate = new Date(student.joining_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + courseDuration);

    const addMonthsKeepingDay = (base, months) => {
      const d = base.getDate();
      const n = new Date(base);
      n.setDate(1);
      n.setMonth(n.getMonth() + months);
      const lastDay = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      n.setDate(Math.min(d, lastDay));
      return n;
    };

    const dueDates = [];
    for (let due = new Date(startDate); due < endDate;) {
      dueDates.push(new Date(due));
      due = addMonthsKeepingDay(due, emi_frequency);
    }

    const emiCount = dueDates.length;
    const baseAmt = Math.floor(finalAmount / emiCount);
    const remainder = finalAmount - baseAmt * emiCount;

    const emiPreview = dueDates.map((date, i) => ({
      due_date: date,
      amount: baseAmt + (i === emiCount - 1 ? remainder : 0),
    }));

    return {
      course_price: coursePrice,
      discount_percentage,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      emi_count: emiCount,
      emi_frequency,
      emi_preview: emiPreview,
    };
  },
  emiAmountCheck: async (id, amount, payment_date) => {
    if (typeof id !== "number") {
      throw new Error(`Expected student_id as number, got ${typeof id}`);
    }
    // return true

    if (!student.joining_date) {
      throw new customError("Student joining_date is missing", 400);
    }

    const course = await coursesRepository.getDataById(student.course_id);
    if (!course)
      throw new customError("Course linked to student not found", 404);

    const coursePrice = Number(course.course_price);
    const courseDuration = Number(course.course_duration); // months
    if (emi_frequency > courseDuration) {
      throw new customError(
        `EMI frequency (${emi_frequency} months) cannot be greater than course duration (${courseDuration} months)`,
        400
      );
    }

    const discountAmount = Math.round(
      (coursePrice * discount_percentage) / 100
    );
    const finalAmount = coursePrice - discountAmount;

    const startDate = new Date(student.joining_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + courseDuration);

    const addMonthsKeepingDay = (base, months) => {
      const d = base.getDate();
      const n = new Date(base);
      n.setDate(1);
      n.setMonth(n.getMonth() + months);
      const lastDay = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
      n.setDate(Math.min(d, lastDay));
      return n;
    };

    const dueDates = [];
    for (let due = new Date(startDate); due < endDate;) {
      dueDates.push(new Date(due));
      due = addMonthsKeepingDay(due, emi_frequency);
    }

    const emiCount = dueDates.length;
    const baseAmt = Math.floor(finalAmount / emiCount);
    const remainder = finalAmount - baseAmt * emiCount;

    const emiPreview = dueDates.map((date, i) => ({
      due_date: date,
      amount: baseAmt + (i === emiCount - 1 ? remainder : 0),
    }));

    return {
      course_price: coursePrice,
      discount_percentage,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      emi_count: emiCount,
      emi_frequency,
      emi_preview: emiPreview,
    };
  },
};

module.exports = Emiservices;
