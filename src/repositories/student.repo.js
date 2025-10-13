const { required } = require("joi");
const { Student, Batches, Session, Course, Student_Enrollment, Emi } = require("../models/index");
const { CrudRepository } = require("./crud.repo");
const { Op, where } = require("sequelize");

class studentRepositories extends CrudRepository {
  constructor() {
    super(Student);
  }

  async getInactiveStudentsBySession(
    sessionId,
    name,
    email,
    contact_no,
    limit,
    offset
  ) {
    const { Op } = require("sequelize");

    const whereCondition = {};

    if (name) {
      whereCondition["name"] = { [Op.iLike]: `%${name}%` };
    }

    if (email) {
      whereCondition["email"] = { [Op.iLike]: `%${email}%` };
    }

    if (contact_no) {
      whereCondition["contact_no"] = { [Op.iLike]: `%${contact_no}%` };
    }

    const enrollmentWhere = {
      status: false, // ✅ Only inactive students from Student_Enrollment table
    };

    if (sessionId) {
      enrollmentWhere["session_id"] = sessionId;
    }

    return await this.model.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "email",
        "contact_no",
        "dob",
        "gender",
        "joining_date",
        "profile_image",
        "enrollment_id",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Student_Enrollment,
          as: "enrollment",
          required: true,
          where: enrollmentWhere, // ✅ Apply inactive filter here
          attributes: [
            "id",
            "fees",
            "status",
            "discount_amount",
            "number_of_emi",
          ],
          include: [
            {
              model: Course,
              attributes: ["id", "course_name", "course_price", "course_duration", "course_type"],
            },
            {
              model: Batches,
              attributes: [
                "id",
                "BatchesName", "StartTime", "EndTime", "status"
              ],
            },
            {
              model: Session,
              attributes: ["id", "session_year"],
            },
          ],
        },
      ],
    });
  }

  async getFilteredStudents(course_id, batch_id, session_id) {
    return await this.model.findAll({
      where: {
        ...(course_id && { course_id }),
        ...(batch_id && { batch_id }),
      },

      include: [
        {
          model: Batches,
          as: "Batch",
          attributes: ["BatchesName", "Session_id"],
          required: true,
          where: { Session_id: session_id },
          include: [
            {
              model: Session,
              attributes: ["session_year"],
              required: true,
            },
          ],
        },
        {
          model: Course,
          attributes: ["course_name"],
          required: true,
        },
      ],
    });
  }

  async getSectionById(id) {
    const student = await Student.findByPk(id, {
      include: [
        {
          model: Batches,
          attributes: ["Session_id"],
          include: [
            {
              model: Session,
              attributes: ["id", "session_year"], // ya jo bhi fields chahiye
            },
          ],
        },
      ],
    });

    return student;
  }

  async getAllStudent(Batch_id) {
    return Student.findAll({
      where: {
        batch_id: Batch_id,
      },
      include: [
        {
          model: Course,
        },
        {
          model: Batches,
        },
      ],
    });
  }
  async getSectionById(id) {
    const student = await Student.findByPk(id, {
      include: [
        {
          model: Batches,
          attributes: ["Session_id"],
          include: [
            {
              model: Session,
              attributes: ["id", "session_year"], // ya jo bhi fields chahiye
            },
          ],
        },
      ],
    });

    return student;
  }


  async getDataByIds(id) {
    return await Student.findOne({
      where: { id },
      include: [
        {
          model: Batches,
          as: "Batch", // Must match alias in Student.belongsTo
          attributes: ["BatchesName"],
        },
        {
          model: Course,
          as: "Course", // Must match alias in Student.belongsTo
          attributes: ["course_price", "course_name", "course_type"],
        },
      ],
    });
  }


  async getDataById(id) {
  return await Student_Enrollment.findOne({
    where: { id },
    include: [
      {
        model: Batches,
        attributes: ["id", "BatchesName"], 
      },
      {
        model: Course,
        attributes: ["id","course_name"], 
      },
      {
        model: Student,
        attributes: ["id", "name", "email", "contact_no", "dob","enrollment_id"], 
      },
    ],
  });
}



  async getDataByIdsinglestudents(id) {
    console.log(id);

    return await Student.findOne({
      where: { id: id },

    })

  }
async getByStudentId(enrollment_id){
  console.log('====================================');
  console.log(enrollment_id);
  const data =  await Student_Enrollment.findOne({
    where: { id:enrollment_id },
    include:[
      {
        model:Student,
        attributes: { exclude: ["password"] }
      },
      {
        model:Course
      }
    ]
  });
  console.log("Repo file code data  ",data);
  return data
}

  async getAllStudents({
    session_id,
    course_id,
    batch_id,
    name = "",
    father_name,
    enrollment_id,
    rt,
    page = 1,
    limit = 10,
  }) {
    const offset = (page - 1) * limit;

    const studentWhere = {
      ...(name && { name: { [Op.iLike]: `%${name}%` } }),
      ...(enrollment_id && { enrollment_id: { [Op.iLike]: `%${enrollment_id}%` } }),
      ...(rt && { rt }),
      ...(father_name && { father_name: { [Op.iLike]: `%${father_name}%` } }),
    };

    const enrollmentWhere = {
      status: true,
      ...(session_id && { session_id }),
      ...(course_id && { course_id }),
      ...(batch_id && { batch_id }),
    };

    const { count, rows } = await Student.findAndCountAll({
      where: studentWhere,
      attributes: [
        "id",
        "name",
        "email",
        "contact_no",
        "dob",
        "gender",
        "rt",
        "joining_date",
        "profile_image",
        "enrollment_id",
      ],
      include: [
        {
          model: Student_Enrollment,
          as: "enrollment",
          required: true,
          where: enrollmentWhere,
          attributes: [
            "id",
            "fees",
            "status",
            "discount_amount",
            "number_of_emi",
          ],
          include: [
            {
              model: Batches,
              required: true,
              attributes: [
                "id",
                "BatchesName", "StartTime", "EndTime", "status"
              ],
            },
            {
              model: Course,
              required: true,
              attributes: ["id", "course_name", "course_price", "course_duration", "course_type"],
            },
            {
              model: Session,
              required: true,
              attributes: ["id", "session_year"],
            },
          ],
        },
      ],
      limit: +limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { count, rows };
  }




}

module.exports = { studentRepositories };
