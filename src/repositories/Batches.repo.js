const { Op, where } = require("sequelize");
const { Batches, Student, Session, Course, Student_Enrollment } = require("../models/index");
const { CrudRepository } = require("./crud.repo");
const customError = require("../utils/error.handler");

class batchesRepositories extends CrudRepository {
  constructor() {
    super(Batches);
  }
  async searchapidta(batchName, course_id, page, limit) {
  const offset = (page - 1) * limit;

  const whereClause = {
    BatchesName: { [Op.like]: `%${batchName}%` },
  };

  if (course_id) {
    whereClause.course_id = course_id;
  }

  const { count, rows } = await Batches.findAndCountAll({
    where: whereClause,
    offset,
    limit: parseInt(limit),
  });

  const totalPages = Math.ceil(count / limit);

  return {
    totalRecords: count,
    totalPages,
    currentPage: parseInt(page),
    data: rows,
  };
}



  async searchapi({ BatchesName, status, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;

    const whereCondition = {};

    // Filter by name if provided
    if (BatchesName && BatchesName.trim()) {
      whereCondition.BatchesName = {
        [Op.iLike]: `%${BatchesName.trim()}%`,
      };
    }

    // Filter by status if provided
    if (status && status.trim()) {
      whereCondition.status = status.trim().toLowerCase(); // assuming 'active' / 'inactive'
    }

    const [batches, totalBatchCount] = await Promise.all([
      Batches.findAll({
        where: whereCondition,
        offset,
        limit,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Course,
            attributes: ["course_name"],
          },
        ],
      }),
      Batches.count({ where: whereCondition }),
    ]);

    return {
      data: batches,
      total: totalBatchCount,
      totalPages: Math.ceil(totalBatchCount / limit),
      currentPage: parseInt(page),
    };
  }



  //   async accessdata(name) {
  //       const whereCondition = name ? { batch_id: name } : {};
  //       const data=await Batches.findByPk(name);
  //       if(!data){
  //           throw new customError("no course found",401)
  //       }
  //       const result = await Student.findAndCountAll({
  //           where: whereCondition,
  //           include: [{
  //               model: Batches,
  //               required:true,
  //               attributes: ['BatchesName'], // Assuming Batches has 'BatchesName' field,
  //           },
  //           {
  //             model: Course,
  //             required:true,
  //             attributes: ['course_name'], // Assuming Batches has 'BatchesName' field
  //         }]
  //       });
  //   console.log("result",result);

  // --------------------------
  //   const [batches, totalBatchCount] = await Promise.all([
  //     Batches.findAll({
  //       where: whereCondition,
  //       offset,
  //       limit,
  //       order: [["createdAt", "DESC"]],
  //       include: [
  //         {
  //           model: Course, // Make sure this matches your association alias
  //           attributes: ["course_name"], // You can include more fields if needed
  //         },

  //       ],
  //     }),
  //     Batches.count({ where: whereCondition }), // count only filtered rows
  //   ]);

  //   return {
  //     data: batches,
  //     total: totalBatchCount,
  //     totalPages: Math.ceil(totalBatchCount / limit),
  //     currentPage: parseInt(page),
  //   };
  // }

  async accessdata(batchId, sessionId) {
    // ✅ Fetch batch with course details
    const batch = await Batches.findByPk(batchId, {
      include: {
        model: Course,
        attributes: ['course_name'],
      },
      attributes: ['BatchesName', 'StartTime', 'EndTime'],
    });

    if (!batch) {
      throw new customError("No batch found", 401);
    }

    // ✅ Fetch only active students from Student_Enrollment by batch + session
    const students = await Student_Enrollment.findAll({
      where: {
        batch_id: batchId,
        session_id: sessionId,  // ✅ Add this
        status: true,
      },
      include: [
        {
          model: Student,
          attributes: ['name', 'enrollment_id'],
        },
        {
          model: Batches,
          attributes: ['BatchesName', 'StartTime', 'EndTime'],
          include: {
            model: Course,
            attributes: ['course_name'],
          },
        },
      ],
    });

 

    return {
      totalActiveStudents: students.length,
      students: students,
    };
  }





}

module.exports = { batchesRepositories };
