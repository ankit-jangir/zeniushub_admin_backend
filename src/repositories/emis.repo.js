const { Emi, Student, Course, Batches, Student_Enrollment } = require("../models/");
const { CrudRepository } = require("./crud.repo");
// const { Op } = require("sequelize");
const { Sequelize, Op } = require('sequelize'); // Ensure Sequelize is imported
const moment = require("../utils/time-zone");
const { raw } = require("express");

class emisRepositories extends CrudRepository {
  constructor() {
    super(Emi);
  }

  // async getFilteredEmiskaran({ status, fromDate, toDate, batchId }) {
  //   const now = new Date();

  //   let whereClause = {
  //     emi_duedate: {
  //       [Op.between]: [fromDate, toDate],
  //     },
  //   };

  //   if (status === "paid") {
  //     whereClause.is_paid = true;
  //   } else if (status === "missed") {
  //     whereClause.is_paid = false;
  //     whereClause.emi_duedate = {
  //       [Op.and]: [
  //         { [Op.between]: [fromDate, toDate] },
  //         { [Op.lt]: now },
  //       ],
  //     };
  //   } else if (status === "upcoming") {
  //     whereClause.is_paid = false;
  //     whereClause.emi_duedate = {
  //       [Op.and]: [
  //         { [Op.between]: [fromDate, toDate] },
  //         { [Op.gt]: now },
  //       ],
  //     };
  //   }
  // // if it goes undefine than server crashes
  // // so dont put it at where contditon so server not crash
  //   const studentWhere = {};
  //   if (batchId) studentWhere.batch_id = batchId;

  //   return await Emi.findAndCountAll({
  //     where: whereClause,
  //     include: [
  //       {
  //         model: Student,
  //         where: studentWhere,
  //         required: true,
  //         attributes: ["id", "name"],
  //         include: [
  //           { model: Batches, as: "Batch", attributes: ["id", "BatchesName"] },
  //         ],
  //       },
  //     ],
  //     order: [["emi_duedate", "ASC"]],
  //   });
  // }


  // emis.repository.js
  async getFilteredEmiskaran({
  status,
  fromDate,
  toDate,
  batchId,
  courseId,
  sessionid,
  page,
  limit,
}) {
  const todayStart = moment().startOf("day");

  // ✅ Step 1: Date validation
  if (fromDate) {
    const fd = moment(fromDate, "YYYY-MM-DD", true);
    if (!fd.isValid()) throw new Error("Invalid fromDate");
    fromDate = fd.startOf("day").toDate();
  }

  if (toDate) {
    const td = moment(toDate, "YYYY-MM-DD", true);
    if (!td.isValid()) throw new Error("Invalid toDate");
    toDate = td.endOf("day").toDate();
  }

  console.log("📅 Filter Dates:", fromDate, "→", toDate);

  const whereClause = {};

  // ✅ Step 2: Apply filters based on status
  if (status === "missed") {
    whereClause.due_amount = { [Op.gt]: 0 };
    whereClause.emi_duedate = {
      [Op.and]: [
        { [Op.between]: [fromDate, toDate] },
        { [Op.lt]: todayStart },
      ],
    };
  } else if (status === "upcoming") {
    whereClause.due_amount = { [Op.gt]: 0 };
    whereClause.emi_duedate = {
      [Op.and]: [
        { [Op.between]: [fromDate, toDate] },
        { [Op.gte]: todayStart },
      ],
    };
  } else if (status === "paid") {
    whereClause.is_paid = true; // ✅ yeh zaroori hai
      whereClause.due_amount = 0; 
    whereClause.payment_date = {
      [Op.between]: [fromDate, toDate],
    };
  } else if (fromDate && toDate) {
    whereClause[Op.or] = [
      { payment_date: { [Op.between]: [fromDate, toDate] } },
      { emi_duedate: { [Op.between]: [fromDate, toDate] } },
    ];
  }
    console.log("🔎 Final WhereClause:", JSON.stringify(whereClause, null, 2));

  const offset = (page - 1) * limit;

  // ✅ Step 3: Query
  const result = await Emi.findAndCountAll({
    where: whereClause,
    attributes: {
      include: [
        [Sequelize.literal('"Emi"."amount" - "Emi"."due_amount"'), "total_received"],
      ],
    },
    include: [
      {
        model: Student_Enrollment,
        required: true,
        where: {
          status: true,
          ...(sessionid && { session_id: sessionid }),
          ...(batchId && { batch_id: batchId }),
          ...(courseId && { course_id: courseId }),
        },
        attributes: ["id", "student_id", "course_id", "batch_id", "session_id"],
        include: [
          { model: Course, attributes: ["id", "course_name"] },
          { model: Batches, attributes: ["id", "BatchesName"] },
          { model: Student, attributes: ["id", "name"] },
        ],
      },
    ],
    order: [["emi_duedate", "ASC"]],
    limit,
    offset,
  });

  console.log("🟢 getFilteredEmis Result Count:", result.count);
    console.log("📋 First Row Example:", result.rows[0]?.toJSON());

  return {
    count: result.count,
    rows: result.rows,
  };
}






































  async downloadGetFilteredEmiskaran({ status, fromDate, toDate, batchId, courseId }) {
    const todayStart = moment().startOf("day");

    const whereClause = {};

    if (fromDate) fromDate = moment(fromDate).startOf("day");
    if (toDate) toDate = moment(toDate).endOf("day");
    console.log("date    ", fromDate, toDate);

    // Apply filters based on status
    if (status === "missed") {
      whereClause.due_amount = { [Op.gt]: 0 };
      whereClause.emi_duedate = {
        [Op.and]: [
          { [Op.between]: [fromDate, toDate] },
          { [Op.lt]: todayStart },
        ],
      };
    } else if (status === "upcoming") {
      whereClause.due_amount = { [Op.gt]: 0 };
      whereClause.emi_duedate = {
        [Op.and]: [
          { [Op.between]: [fromDate, toDate] },
          { [Op.gte]: todayStart },
        ],
      };
    } else if (status === "paid") {
      whereClause.payment_date = {
        [Op.between]: [fromDate, toDate],
      };
    } else if (fromDate && toDate) {
      whereClause[Op.or] = [
        { payment_date: { [Op.between]: [fromDate, toDate] } },
        { emi_duedate: { [Op.between]: [fromDate, toDate] } },
      ];
    }

    // Student & course filters
    const studentWhere = { status: "active" };
    if (batchId) studentWhere.batch_id = batchId;

    const courseWhere = { status: "active" };
    if (courseId) courseWhere.course_id = courseId;

    //  limit = limit || 10; // items per page (default: 10)
    // const page = page || 1;    // current page (default: 1)
    // const offset = (page - 1) * limit;

    // const result = await Emi.findAndCountAll({
    //   where: whereClause,
    //   attributes: {
    //     include: [
    //       [Sequelize.literal('"Emi"."amount" - "Emi"."due_amount"'), "total_received"],
    //     ],
    //   },
    //   include: [
    //     {
    //       model: Student,
    //       required: true,
    //       where: studentWhere,
    //       attributes: ["id", "name", "enrollment_id"],
    //       include: [
    //         {
    //           model: Batches,
    //           where: courseWhere,
    //           required: true,
    //           attributes: ["id", "BatchesName"],
    //           include: [
    //             {
    //               model: Course,
    //               required: true,
    //               where: { status: "active" },
    //               attributes: ["id", "course_name"],
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   ],
    //   order: [["emi_duedate", "ASC"]]
    // });

    const result = await Emi.findAndCountAll({
  where: whereClause,
  attributes: {
    include: [
      [Sequelize.literal('"Emi"."amount" - "Emi"."due_amount"'), "total_received"],
    ],
  },
  include: [
    {
      model: Student_Enrollment,
      required: true,
       where: { status: true, ...(batchId && { batch_id: batchId }) }, 
      attributes: ["id"],
      include: [
        {
          model: Student,
          required: true,
          // where: studentWhere,
          attributes: ["id", "name", "enrollment_id"],
        },
        {
          model: Batches,
          required: true,
          where: courseWhere,
          attributes: ["id", "BatchesName"],
          include: [
            {
              model: Course,
              required: true,
              where: { status: "active" },
              attributes: ["id", "course_name"],
            },
          ],
        },
      ],
    },
  ],
  order: [["emi_duedate", "ASC"]],
});


    return {
      count: result.count,
      rows: result.rows, // Each `row` now contains `total_received`
    };
  }







  async getEmisByDate(start, end) {
    const result = await this.model.sequelize.query(
      `
    SELECT
      -- Total amount of EMIs due in the given range
      SUM(CASE 
        WHEN emi_duedate BETWEEN :start AND :end 
        THEN amount 
        ELSE 0 
      END) AS total_expected,

      -- Actual paid amount in range (amount - due_amount)
      SUM(CASE 
        WHEN payment_date BETWEEN :start AND :end 
        THEN (amount - due_amount) 
        ELSE 0 
      END) AS total_received,

      -- Amount still to collect (within date range)
      SUM(CASE 
        WHEN emi_duedate BETWEEN :start AND :end 
        THEN due_amount 
        ELSE 0 
      END) AS amount_to_collect

    FROM "Emis" e
     JOIN "Student_Enrollments" sd ON e.enrollment_id = sd.id
  JOIN "students" s ON sd.student_id = s.id
    JOIN "Batches" b ON sd.batch_id = b.id
    JOIN "Courses" c ON sd.course_id = c.id
    WHERE sd.status = true
    `,
      {
        replacements: { start, end },
        type: this.model.sequelize.QueryTypes.SELECT,
      }
    );

    return result[0];
  }


  async emivelidactiond() {

  }

}

module.exports = { emisRepositories };
