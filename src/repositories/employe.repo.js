const { Employee, EmployeeTask, Department, Admin, emp_subj, Subject, SubjectCourse, Course, emp_batch, Batches } = require("../models/");
const { Op } = require("sequelize")
const { CrudRepository } = require("./crud.repo");
const customError = require("../utils/error.handler");

class employeeRepositories extends CrudRepository {
  constructor() {
    super(Employee);
  }

  async getSingleEmployeeDataById(id) {
    return await this.model.findByPk(id, {
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      include: [
        {
          model: emp_subj,
          attributes: ['subject_id'],
          include: [
            {
              model: Subject,
              // as:'subject',
              attributes: ['id', 'subject_name'],
              where: {
                status: 'active'
              },
              include: [{
                model: SubjectCourse,
                attributes: ['course_id'],
                include: [{
                  model: Course,
                  attributes: ['id', 'course_name'],
                  where: {
                    status: 'active'
                  }
                }]
              }]
            }
          ]
        },
        {
          model: emp_batch,
          attributes: ['batch_id'],
          include: [{
            model: Batches,
            // as:'batch',
            attributes: ['id', 'BatchesName']
          }]
        }
      ]

    }
    );
  }

  async getEmployeeTask(employee_id) {
  return await Employee.findAll({
    where: { id: employee_id },
    attributes: { 
      exclude: ["password", "account_number", "ifsc_code", "socket_id"] 
    },
    include: [
      {
        model: EmployeeTask,
        include: [
          {
            model: Admin,
            attributes: { 
              exclude: ["password", "socket_id"] 
            }
          }
        ]
      }
    ]
  });
}


  async getEmployee() {
    return await Employee.findAll({
      include: [{ model: EmployeeTask }]
    });

  }

  async Firlterdata(id) {
    console.log("Filter Repo: Department ID ->", id);
    const employees = await Employee.findAll({
      where: {
        department: {
          [Op.contains]: [id]  // ✅ This checks if department array contains the given id
        }
      }
    });
    if (!employees || employees.length === 0) {
      throw new customError(`Employees data with department id ${id} does not exist`);
    }

    return employees;
  }

  // async getSearchEmployee(criteria, limit, offset){
  //     return await this.model.findAndCountAll({
  //       where: criteria,
  //       include: [{ model:EmployeeTask },{model:Department}] ,
  //       limit, // Number of records per page
  //       offset, // Skip records for pagination
  //     });
  // }

  async getSearchEmployee(criteria, limit, offset) {
    const employees = await this.model.findAndCountAll({
      where: criteria,
      limit,
      offset,
      order: [['updatedAt', 'DESC']], // 👈 Add this line
      attributes: ['id', 'first_name', 'department', 'joining_date', 'start_time', 'end_time', 'email', 'status', 'image_path'],
      include: []
    });


    // console.log(employees)

    // For each employee, manually fetch their department info
    const rowsWithDepartments = await Promise.all(
      employees.rows.map(async (employee) => {
        const departmentIds = employee.department || [];

        const departments = await Department.findAll({
          where: {
            id: {
              [Op.in]: departmentIds
            }
          }
        });

        // 👇 Count total tasks for the employee
        const totalTasks = await EmployeeTask.count({
          where: {
            employee_id: employee.id
          }
        });

        // 👇 Count completed tasks for this employee
        const completedTasks = await EmployeeTask.count({
          where: {
            employee_id: employee.id,
            status: 'completed'
          }
        });

        // const employeeJSON = employee.toJSON();
        return {
          ...employee.toJSON(),
          department_names: departments.map(dep => dep.name),
          total_tasks: totalTasks,
          completed_tasks: completedTasks // 👈 Add this to response
        };
      })
    );

    return {
      count: employees.count,
      rows: rowsWithDepartments
    };
  }

  // async searchInActiveData(criteria, limit, offset) {
  //   return await this.model.findAndCountAll({
  //     where: criteria,
  //     attributes: ['id','first_name','department','joining_date'],
  //     limit, // Number of records per page
  //     offset, // Skip records for pagination
  //   });
  // },

  async searchInActiveData(criteria, limit, offset) {
    const employees = await this.model.findAndCountAll({
      where: criteria,
      limit,
      offset,
      attributes: ['id', 'first_name', 'department', 'joining_date', 'email', 'status', 'start_time', 'end_time', 'image_path'],
      // include: [{ model: EmployeeTask }]
    });


    // console.log(employees)

    // For each employee, manually fetch their department info
    const rowsWithDepartments = await Promise.all(
      employees.rows.map(async (employee) => {
        const departmentIds = employee.department || [];

        const departments = await Department.findAll({
          where: {
            id: {
              [Op.in]: departmentIds
            }
          }
        });

        return {
          ...employee.toJSON(),
          department_names: departments.map(dep => dep.name)
        };
      })
    );

    return {
      count: employees.count,
      rows: rowsWithDepartments
    };
  }

  async getEmployeeBatchSubject(employee_id) {
    return await Employee.findAll({
      where: { id: employee_id },
      attributes: ["id", "first_name"],
      include: [
        {
          model: emp_batch,
          attributes: ["batch_id"],
          include: [
            {
              model: Batches,
              attributes: ["course_id", "BatchesName", "status", "EndTime", "StartTime"],
              include: [
                {
                  model: Course,
                  attributes: ["status", "course_price", "course_duration", "course_name"]
                }
              ]
            }
          ]
        },
        {
          model: emp_subj,
          attributes: ["subject_id", "course_id"],
          include: [
            {
              model: Subject,
              attributes: ["status", "subject_name"],

            },
            {
              model: Course,
              attributes: ["status", "course_price", "course_duration", "course_name"]
            }
          ]
        }
      ]
    });
  }

  async employeseacrhing(first_name) {
    const whereClause = {};

    if (typeof first_name === "string" && first_name.trim() !== "") {
      whereClause.first_name = {
        [Op.like]: `%${first_name.trim()}%`
      };
    }

    const data = await Employee.findAll({
      where: whereClause
    });


    return data;
  }
  async employeactive(name = '', departmentid, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Employee.findAndCountAll({
      where: {
        first_name: { [Op.iLike]: `%${name}%` },
        department: { [Op.contains]: [parseInt(departmentid)] },
        status: 'Active'
      },
      offset,
      limit,
      raw: true
    });

    return {
      data: rows,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalRecords: count,
      page,
      limit
    };
  }
}

//

module.exports = { employeeRepositories };



// const { Op } = require("sequelize");
// const { Employee, Department, EmployeeTask } = require("../models/");

// async getSearchEmployee(criteria, limit, offset) {
//   const employees = await this.model.findAndCountAll({
//     where: criteria,
//     limit,
//     offset,
//     include: [{ model: EmployeeTask }]
//   });

//   // For each employee, manually fetch their department info
//   const rowsWithDepartments = await Promise.all(
//     employees.rows.map(async (employee) => {
//       const departmentIds = employee.department || [];

//       const departments = await Department.findAll({
//         where: {
//           id: {
//             [Op.in]: departmentIds
//           }
//         }
//       });

//       return {
//         ...employee.toJSON(),
//         departments // this is full department info
//       };
//     })
//   );

//   return {
//     count: employees.count,
//     rows: rowsWithDepartments
//   };
// }