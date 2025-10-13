const employeeService = require("../services/employe.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const {
  employeeTimingSchema,
} = require("../validators/employeeTimingValidation");
const { employeeSchema } = require("../validators/employeeValidator");
const Joi = require("joi");
const { empSubjRepositories } = require("../repositories/emp_subj.repo");
const { empBatchRepositories } = require("../repositories/emp_batch.repo");
const empSubjRepository = new empSubjRepositories();
const emp_batchRepository = new empBatchRepositories();

const { z } = require("zod");
const path = require('path');
const fs = require('fs');
const { success } = require("zod/v4");

const employeeController = {
  addEmployee: try_catch(async (req, res) => {
    const fileData = {
      ...req.body,
      salary: JSON.parse(req.body.salary),
      department: JSON.parse(req.body.department),
      image_path: req.file ? req.file.filename : null,
    };


    const result = employeeSchema.safeParse(fileData);
    if (!result.success) {
      throw result.error;
    }
    //     if (!result.success) {
    //       // Zod error formatting
    //     const toCamelCase = (str) =>
    //   str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

    // const formattedErrors = Object.entries(result.error.format())
    //   .filter(([field]) => field !== "_errors")
    //   .map(([field, err]) => ({
    //     field: toCamelCase(field),
    //     messages: (err._errors || []).map((msg) =>
    //       msg.replace(/"/g, "")
    //     ),
    //   }));

    //       return res.status(400).json({
    //         success: false,
    //         message: "Validation Error",
    //         errors: formattedErrors,
    //       });
    //     }

    await employeeService.addEmployee(fileData, req.file);
    return res.send({
      success: true,
      message: "Employee created successfully",
    });
  }),

  getEmployee: try_catch(async (req, res) => {
    const getResponse = await employeeService.getEmployee();

    // Validate if employees exist
    if (!getResponse || getResponse.length === 0) {
      throw new customError("No employees found", 400);
    }
    // if (!getResponse || getResponse.length === 0) {
    //   return res.status(404).send({ message: "No employees found" });
    // }

    return res.send({ getResponse });
  }),
  getSingleEmployee: try_catch(async (req, res) => {
    const { id } = req.params;
    const getSingleEmployee = await employeeService.getEmployeeById(id);

    // Validate if employee exists
    if (!getSingleEmployee) {
      throw new customError("Employee not found", 400);
    }
    // if (!getSingleEmployee) {
    //   return res.status(404).send({ message: "Employee not found" });
    // }

    return res.send({ getSingleEmployee });
  }),
  updateEmployee: try_catch(async (req, res) => {
    const { id } = req.params;
    // const updateData = req.body;
    const fileData = {
      ...req.body,
      salary: req.body.salary ? JSON.parse(req.body.salary) : null,
      department: req.body.department ? JSON.parse(req.body.department) : null,
      // image_path: req.file ? req.file.filename : null,
    };

    // console.log(fileData,"************************** fileData")

    // const resultValidation = employeeSchema
    //   // .pick({ first_name: true, email: true, contact_number: true })
    //   .safeParse(fileData);

    const resultValidation = employeeSchema.safeParse(fileData);
    // const result = employeeSchema.safeParse(fileData);
    if (!resultValidation.success) {
      throw resultValidation.error;
    }

    // if (!resultValidation.success) {
    //   // Zod error formatting
    //   const formattedErrors = Object.entries(
    //     resultValidation.error.format()
    //   ).map(([field, err]) => ({
    //     field,
    //     messages: err._errors || [],
    //   }));

    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation Error",
    //     errors: formattedErrors,
    //   });
    // }

    // console.log(
    //   resultValidation,
    //   "************************** resultValudation"
    // );
    // console.log(
    //   resultValidation.data,
    //   "************************** resultValudation.data"
    // );
    // Call service to update employee
    const result = await employeeService.updateEmployee(
      id,
      resultValidation.data,
      req.file
    );

    // If employee does not exist
    if (!result) {
      throw new customError("No employees found", 400);
    }
    // if (!result) {
    //   return res
    //     .status(404)
    //     .send({ success: false, message: "Employee not found" });
    // }

    return res.send({
      success: true,
      message: "Employee updated successfully",
    });
  }),
  deleteEmployee: try_catch(async (req, res) => {
    const { id } = req.params;
    const result = await employeeService.updateEmployee(id, {
      status: "Inactive",
    });

    if (result) {
      return res.send({ "success": true, message: "Employee deleted successfully" });
    } else {
      // return res.status(404).send({ message: "Employee not found" });
      throw new customError("No employees found", 400);
    }

    // if (!getResponse || getResponse.length === 0) {
    //       throw new customError("No employees found", 400);
    //     }
  }),
  searchEmployee: try_catch(async (req, res) => {
    const query = req.query; // Extract query parameters from the URL (e.g., ?firstName=rajat)

    // Call the service method with the query parameters
    const result = await employeeService.searchEmployee(query);
    // console.log(result,"******************************************88")

    // if (!result.employees || result.employees.length === 0) {
    //   return res.status(404).send({ message: "No employees found" });
    // }

    // Otherwise, return the filtered employees
    // console.log(result.employees,"********************** result employees")
    return res.send({
      result: {
        employees: result.employees || [],
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
        totalEmployees: result.totalEmployees || 0,
        message:
          result.employees.length === 0 ? "No employees found" : undefined,
      },
    });
  }),
  updateEmployeeTiming: try_catch(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const { error } = employeeTimingSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      throw new customError(error, 400);
    }
    // Call service to update employee
    const result = await employeeService.updateEmployeeTime(id, updateData);

    // If employee does not exist
    // if (!result) {
    //   return res.status(404).send({ message: "Employee not found" });
    // }

    if (!result) {
      throw new customError("No employees found", 400);
    }

    return res.send({ "success": true, message: "Employee Timing updated successfully" });
  }),
  // searchingbyrediController : async(req,res)=>{
  //   const {first_name,page,limit} = req.body
  //   // console.log(first_name);
  //   const data = await employeeService.searchingbyredis(first_name,page,limit);
  //   return res.send({ message: "Employee  show successfully",data:data })
  // }

  searchingbyrediController: async (req, res) => {
    try {
      const { first_name, page, limit } = req.body;

      if (!first_name) {
        return res.status(400).json({
          success: false,
          message: "First name is required",
        });
      }

      const data = await employeeService.searchingbyredis(
        first_name,
        page,
        limit
      );
      // console.log("data : : : ",data)

      return res.status(200).json({
        success: true,
        message: "Employee data fetched successfully",
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updateEmployeecontroller: try_catch(async (req, res) => {
    const data = await employeeService.updateEmployees(req.body);

    res.status(200).json({
      "success": true,
      // status: "success",
      data: data,
    });
  }),

  updateEmployeeStatus: try_catch(async (req, res) => {
    const { id } = req.params;

    // Fetch the current employee from the database
    const employee = await employeeService.getEmployeeById(id);

    if (!employee) {
      throw new customError("No employees found", 400);
    }
    // if (!employee) {
    //   return res.status(404).send({ message: "Employee not found" });
    // }

    // Toggle status: If Active → Inactive, If Inactive → Active
    const newStatus = employee.status === "Active" ? "Inactive" : "Active";

    // Validate only the "status" field
    const statusSchema = Joi.object({
      status: Joi.string().valid("Active", "Inactive").required(),
    });
    // // Pick only the status field for validation
    // const statusSchema = employeeSchema.extract("status");

    // Validate new status using Joi (only for "status" field)
    const { error } = statusSchema.validate(
      { status: newStatus },
      { abortEarly: false }
    );
    if (error) {
      throw new customError(error, 400);
    }

    // Call service to update employee status
    const result = await employeeService.updateEmployeeStatus(id, {
      status: newStatus,
    });

    // if (!result) {
    //   return res
    //     .status(500)
    //     .send({ message: "Failed to update employee status" });
    // }

    if (!result) {
      throw new customError("Failed to update employee status", 500);
    }

    return res.send({ "success": true, message: `Employee status updated to ${newStatus}` });

    // // Pick only the status field for validation
    // const statusSchema = employeeSchema.extract("status");

    // const { error } = statusSchema.validate({"status": "Inactive"}, { abortEarly: false });
    // if (error) {
    //     throw new customError(error, 400);
    // }

    // // Call service to update employee
    // const result = await employeeService.updateEmployeeStatus(id, {status: "Inactive"});

    // // If employee does not exist
    // if (!result) {
    //   return res.status(404).send({ message: "Employee not found" });
    // }

    // return res.send({ message: "Employee Status updated successfully" });
  }),

  searchInActiveEmployee: try_catch(async (req, res) => {
    const query = req.query; // Extract query parameters from the URL (e.g., ?firstName=rajat)

    // Call the service method with the query parameters
    const result = await employeeService.searchIAEmployee(query);

    // if (!result.employees || result.employees.length === 0) {
    //   return res.status(404).send({ message: "No employees found" });
    // }
    return res.send({
      result: {
        employees: result.employees || [],
        currentPage: result.currentPage || 1,
        totalPages: result.totalPages || 0,
        totalEmployees: result.totalEmployees || 0,
        message:
          result.employees.length === 0 ? "No employees found" : undefined,
      },
    });
    // Otherwise, return the filtered employees
    // return res.send({ result });
  }),

  markEmployeesPresent: try_catch(async (req, res) => {
    const { employeeIds, dates } = req.body;

    if (
      !Array.isArray(employeeIds) || employeeIds.length === 0 ||
      !Array.isArray(dates) || dates.length === 0
    ) {
      throw new customError("employeeIds and dates must be non-empty arrays", 400);
    }

    const result = await employeeService.markEmployeesPresent(employeeIds, dates);

    return res.status(200).json({
      success: true,
      message: "Employees marked as present for selected.",
    });
  }),



  markAllPresent: try_catch(async (req, res) => {
    const { dates } = req.body;

    // Validate dates
    if (!Array.isArray(dates) || dates.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide a non-empty list of dates." });
    }

    await employeeService.markAllEmployeesPresent(dates);

    return res
      .status(200)
      .json({ success: "true", message: "Attendance marked successfully for all employees." });
  }),

  createEmpBatch: async (req, res) => {
    try {
      const { employee_id, batch_id, sessionId } = req.body;

      if (!employee_id || !batch_id) {
        return res
          .status(400)
          .json({ message: "Employee ID and Batch ID are required" });
      }

      const result = await employeeService.createEmpBatch(
        employee_id,
        batch_id,
        sessionId
      );

      if (result.exists) {
        return res
          .status(409)
          .json({ message: "Employee is already assigned to this batch" });
      }

      return res.status(201).json({
        message: "Employee Batch assigned successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Error in createEmpBatch:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  postEmpSubj: async (req, res) => {
    const { employee_id, subject_id, session_Id, course_id } = req.body;

    console.log('====================================');
    console.log('Body:----------------------->', req.body);
    console.log('====================================');

    if (!employee_id || !subject_id || !session_Id || !course_id) {
      return res.status(400).json({
        message: "employee_id, subject_id, and session_Id and course_id are required"
      });
    }

    try {
      const result = await employeeService.createEmpSubj({
        employee_id,
        subject_id,
        session_Id,
        course_id
      });

      if (!result) {
        return res.status(500).json({
          message: "Failed to assign subject to employee"
        });
      }

      if (result.exists) {
        return res.status(409).json({
          message: "This subject is already assigned to the employee"
        });
      }

      return res.status(201).json({
        message: "Subject assigned to employee",
        data: result.data
      });

    } catch (error) {
      console.error("Error assigning subject:", error.message);
      return res.status(500).json({
        message: error.message || "Internal Server Error"
      });
    }
  },

  assignEmployee: try_catch(async (req, res) => {
    const assignEmployeeSchema = z.object({
      course_id: z
        .number({
          required_error: "course_id is required",
          invalid_type_error: "course_id must be a number",
        })
        .int()
        .positive(),

      batch_id: z.union([
        z.number({
          required_error: "batch_id is required",
          invalid_type_error: "batch_id must be a number",
        }).int().positive(),
        z.array(z.number({
          invalid_type_error: "Each batch_id must be a number",
        }).int().positive()).nonempty({
          message: "batch_id array must not be empty",
        }),
      ], {
        invalid_type_error: "batch_id must be a number or an array of numbers",
        required_error: "batch_id is required"
      }),

      subjectId: z.union([
        z.number({
          required_error: "subject_id is required",
          invalid_type_error: "subject_id must be a number",
        }).int().positive(),
        z.array(z.number({
          invalid_type_error: "Each subject_id must be a number",
        }).int().positive()).nonempty({
          message: "subject_id array must not be empty",
        }),
      ], {
        invalid_type_error: "subject_id must be a number or an array of numbers",
        required_error: "subject_id is required"
      }),

      employeeId: z
        .number({
          required_error: "employeeId is required",
          invalid_type_error: "employeeId must be a number",
        })
        .int()
        .positive(),

      session_Id: z
        .number({
          required_error: "session_Id is required",
          invalid_type_error: "session_Id must be a number",
        })
        .int()
        .positive(),
    });

    const result = assignEmployeeSchema.safeParse(req.body);

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }

    await employeeService.assignEmployee(req.body);

    return res.status(200).send({
      status: "001",
      message: "Employee assigned to batches and subjects successfully",
    });
  }),


  getEmployeeBatchSubject: try_catch(async (req, res) => {
    const employeeValidationSchema = z.object({
      id: z.number().int().positive(),

    });
    const result = employeeValidationSchema

      .safeParse({ id: parseInt(req.params.employee_id) });

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }
    const employeeBatchSubject = await employeeService.getEmployeeBatchSubject(
      req.params.employee_id
    );
    return res.status(200).send({ status: "001", employeeBatchSubject });
  }),

  getActiveEmp: try_catch(async (req, res) => {
    const activeEmployees = await employeeService.getActiveEmp();

    if (!activeEmployees || activeEmployees.length === 0) {
      throw new customError("No active employees found", 400);
    }

    return res.status(200).send({
      status: "001",
      message: "Active employees fetched successfully",
      data: activeEmployees,
    });
  }),

  searchActiveEmployee: try_catch(async (req, res) => {
    const query = req.query;

    const result = await employeeService.searchActiveEmployee(query);

    return res.send({
      result: {
        employees: result.employees || [],
        totalEmployees: result.totalEmployees || 0,
        message:
          (result.employees || []).length === 0
            ? "No employees found"
            : undefined,
      },
    });
  }),

  searchempcontroller: try_catch(async (req, res) => {
    const { first_name, attendence_date, page, limit, status } = req.query;
    console.log("controller file code : ", attendence_date)
    const data = await employeeService.searchemp(first_name, attendence_date, page, limit, status);

    if (!data || data.length === 0) {
      throw new customError("No employees found", 400);
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully.",
      data
    });
  }),

  // controllers/employeeController.js
  saveEmployeeInExcel: try_catch(async (req, res) => {
    const { attendence_date } = req.query;

    const excelBuffer = await employeeService.saveEmployeeInExcelServices(attendence_date);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=attendance_${Date.now()}.xlsx`);
    res.send(excelBuffer);
  }),

  deleteEmployeeBatchSubject: try_catch(async (req, res) => {
    const deleteAssignEmployeeSchema = z
      .object({
        employee_id: z
          .number({
            required_error: "employee_id is required",
            invalid_type_error: "employee_id must be a number",
          })
          .int()
          .positive(),

        subject_id: z
          .number({
            invalid_type_error: "subject_id must be a number",
          })
          .int()
          .positive()
          .optional(),

        batch_id: z
          .number({
            invalid_type_error: "batch_id must be a number",
          })
          .int()
          .positive()
          .optional(),
      })
      .refine(
        (data) =>
          (data.subject_id !== undefined && data.batch_id === undefined) ||
          (data.subject_id === undefined && data.batch_id !== undefined),
        {
          message: "Either subject_id or batch_id is required, but not both",
          path: ["subject_id", "batch_id"],
        }
      );

    const result = deleteAssignEmployeeSchema.safeParse({
      employee_id: req.query.employee_id
        ? parseInt(req.query.employee_id)
        : undefined,
      batch_id: req.query.batch_id ? parseInt(req.query.batch_id) : undefined,
      subject_id: req.query.subject_id
        ? parseInt(req.query.subject_id)
        : undefined,
    });

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }
    await employeeService.deleteEmployeeBatchSubject(req.query);
    return res
      .status(200)
      .send({ status: "001", message: "Delete successfully" });
  }),
};

module.exports = employeeController;
