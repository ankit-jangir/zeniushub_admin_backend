// const { CrudRepository } = require("./crud.repo");
// const {Attendance,Batches,Student} = require('../models/index');
// const { Op } = require("sequelize");
// class attendencerepositries extends CrudRepository {
//     constructor() {
//         super(Attendance);
//     }
//      async getFilteredData ({ fromDate, toDate,course_id,Batch_id })  {
//         return await Attendance.findAll({
//             where: {
//               attendance_date: {
//                 [Op.gte]: fromDate,
//                 [Op.lte]: toDate
//               }
//             },
//             include:[
//               {
//                 model:Student,   
//                 where: Batch_id ? { batch_id: Batch_id } : undefined,
//                 include:[
//                   {
//                     model:Batches,
//                     where:{course_id:course_id}
//                   }
//                 ]
//               }
//             ]
//           });
//       } 
// }

// module.exports = { attendencerepositries }


const { CrudRepository } = require("./crud.repo");
const { Attendance, Batches, Student, Course, Student_Enrollment } = require('../models/index');
const { Op } = require("sequelize");
const { required } = require("joi");
// const {Student_Enrollment} = require("../models/index");

class attendencerepositries extends CrudRepository {
  constructor() {
    super(Attendance);
  }

  // async getFilteredData({ fromDate, toDate, Batch_id }) {
  //   const data = await Attendance.findAll({
  //     where: {
  //       attendance_date: {
  //         [Op.gte]: fromDate,
  //         [Op.lte]: toDate,
  //       },
  //     },
  //     attributes: [
  //       'id',
  //       'student_enrollment_id',
  //       'status',
  //       'attendance_date',
  //       'in_time',
  //       'out_time',
  //     ],
  //     include: [
  //       {
  //         model: Student_Enrollment,
  //         as: 'Student_Enrollment',
  //         required: true,
  //         where: { batch_id: Batch_id },
  //         include: [
  //           {
  //             model: Student,
  //             attributes: ['id', 'name'],
  //           },
  //           {
  //             model: Batches,
  //             attributes: ['BatchesName'],
  //           },
  //           {
  //             model: Course,
  //             attributes: ['course_name'],
  //           },
  //         ],
  //       },
  //     ],
  //   });

  //   console.log('====================================');
  //   console.log(data);
  //   console.log('====================================Data');

  //   return data;
  // }


  async getFilteredData({ fromDate, toDate, Batch_id }) {
  const data = await Student_Enrollment.findAll({
    where: { batch_id: Batch_id },
    include: [
      {
        model: Student,
        attributes: ['id', 'name'],
      },
      {
        model: Attendance,
        as: 'Attendances',
        attributes: { exclude: ['enrollment_id'] },
        where: {
          attendance_date: {
            [Op.gte]: fromDate,
            [Op.lte]: toDate,
          },
        },
        required: false, // ⭐ IMPORTANT if you want students without attendance also
      },
      {
        model: Batches,
        attributes: ['BatchesName'],
      },
      {
        model: Course,
        attributes: ['course_name'],
      },
    ],
    raw: true,
  });

  // console.log('====================================');
  // console.log(data);
  // console.log('====================================Data');

  return data;
}




}

module.exports = { attendencerepositries };
