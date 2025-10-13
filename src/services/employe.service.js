const { Department } = require("../models/");
const { EmployeeAttendence } = require("../models");
const { employeeRepositories } = require("../repositories/employe.repo");
const fs = require("fs");
const customError = require("../utils/error.handler");
// const { Op } = require("sequelize");
// const redis = require("../config/redis.config");
const redis = require("../../src/config/redis.config");
const employeeRepository = new employeeRepositories();
const { Employee } = require("../models/index");
const { fn, col, where, Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { empBatchRepositories } = require("../repositories/emp_batch.repo");
const empBatchRepository = new empBatchRepositories();
const { empSubjRepositories } = require("../repositories/emp_subj.repo");
const empSubjRepository = new empSubjRepositories();
const { sessionRepositories } = require("../repositories/session.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
const {
  SubjectCoursesRepositories,
} = require("../repositories/Subject_courses.repo");
const SubjectRepositorie = new SubjectRepositories();
const EmployeeAttendanceRepository = require("../repositories/EmployeeAttendance.repo");
const { uploadFileToAzure } = require("../utils/azureUploader");

const moment = require('moment');

const { CoursesRepositories } = require("../repositories/courses.repo");

const batchRepository = new batchesRepositories();
const courseRepository = new CoursesRepositories();
const subjectRepository = new SubjectRepositories();
const subjectCourseRepository = new SubjectCoursesRepositories();
const sessionRepository = new sessionRepositories();

const ExcelJS = require("exceljs");
const XLSX = require('xlsx');
const path = require('path');



const employeeService = {
  addEmployee: async (data, file) => {
    // const filePath = file.path;
    // const buffer = fs.readFileSync(filePath);
    // const blobName = `employeeProfile/${file.filename}`
    // const mimeType = file.mimetype

    // console.log(filePath,"*************** filePath");
    // console.log(buffer,"*************** buffer");
    // console.log(blobName,"*************** blobName");
    // console.log(mimeType,"*************** mimeType");

    const existingEmployee = await employeeRepository.getOneData({
      email: data.email,
    });
    // console.log("*******************************", existingEmployee);
    if (existingEmployee) {
      throw new customError("Employee with this email already exists", 400);
    }
    // console.log(data, "sd");

    // ******************************* validate account Number
    const existingEmployeeAcountNumber = await employeeRepository.getOneData({
      account_number: data.account_number,
    });

    if (existingEmployeeAcountNumber) {
      throw new customError("Employee with this Account number already exists");
    }

    const existingEmployeeByContact = await employeeRepository.getOneData({
      contact_number: data.contact_number,
    });

    if (existingEmployeeByContact) {
      throw new customError(
        "Employee with this contact number already exists",
        404
      );
    }

    //************************************* check department id already exist */
    if (new Set(data.department).size !== data.department.length) {
      throw new customError("Duplicate department IDs are not allowed", 400);
    }

    if (!data.password && data.email) {
      const hashedPassword = await bcrypt.hash(data.email, 10);
      data.password = hashedPassword; // You can customize this pattern
    }

    // ***************************** image validation
    if (file) {
      const filePath = file.path;
      const buffer = fs.readFileSync(filePath);
      const blobName = `employeeProfile/${file.filename}`;
      const mimeType = file.mimetype;

      console.log(filePath, "*************** filePath");
      console.log(buffer, "*************** buffer");
      console.log(blobName, "*************** blobName");
      console.log(mimeType, "*************** mimeType");

      const result = await uploadFileToAzure(buffer, blobName, mimeType);

      console.log(result, "*************************** result");

      if (!result.success) {
        throw new customError(`Azure upload failed: ${result.error}`, 502);
      }

      const fullUrl = result.url;
      // console.log(fullUrl, "************************** fullUrl");
      const imagePath = fullUrl.split("/").slice(-2).join("/");
      // console.log(imagePath, "************************** imagePath");

      data.image_path = imagePath;
    } else {
      // If no file, you can keep image_path as null or undefined or ""
      data.image_path = null;
    }

    // console.log(data,"********************************* data");
    await employeeRepository.create(data);
  },
  getEmployee: async () => {
    const getAllEmployee = await employeeRepository.getAllWithCondition({
      status: "Active", // Ensure only active employees are fetched
    }, ['id', 'first_name']);
    return getAllEmployee;
  },
  getEmployeeById: async (id) => {
    const getSingleEmployee =
      await employeeRepository.getSingleEmployeeDataById(id);

    if (!getSingleEmployee) {
      return null;
    }

    // Get the department IDs
    const departmentIds = getSingleEmployee.department || [];

    // Fetch department names (no mapping manually)
    const departments = await Department.findAll({
      where: {
        id: {
          [Op.in]: departmentIds,
        },
      },
      attributes: ["id", "name"],
    });

    // Just add departments array directly to employee
    const result = {
      ...getSingleEmployee.toJSON(),
      departments,
    };

    return result;
  },
  updateEmployee: async (id, updateData, file) => {
    // Check if employee exists
    // console.log(file,"******************************* file")
    // console.log(updateData,"********************** updateData");
    const employee = await employeeRepository.getDataById(id);
    // If employee doesn't exist, return false
    if (!employee) {
      return false;
    }

    // console.log(employee.contact_number,"************************** employee");
    // console.log(updateData.contact_number,"*************************** updateData");

    if (employee.contact_number != updateData.contact_number) {
      // Only validate contact_number if it's actually provided
      if (updateData.contact_number) {
        const existingEmployeeByContact = await employeeRepository.getOneData({
          contact_number: updateData.contact_number,
        });

        if (existingEmployeeByContact && existingEmployeeByContact.id !== id) {
          throw new customError(
            "Employee with this contact number already exists",
            404
          );
        }
      }

    }

    // ***************************** image validation
    if (file) {
      const filePath = file.path;
      const buffer = fs.readFileSync(filePath);
      const blobName = `employeeProfile/${file.filename}`;
      const mimeType = file.mimetype;

      const result = await uploadFileToAzure(buffer, blobName, mimeType);


      if (!result.success) {
        throw new customError(`Azure upload failed: ${result.error}`, 502);
      }

      const fullUrl = result.url;
      const imagePath = fullUrl.split("/").slice(-2).join("/");

      updateData.image_path = imagePath;
    }


    // Update employee data if employee exists
    await employeeRepository.update(updateData, { id: id });
    return true; // Indicate that the employee was updated successfully
  },
  deleteEmployee: async (id, updateData) => {
    const employee = await employeeRepository.getDataById(id);
    if (!employee) {
      return false; // Employee not found
    }
    await employeeRepository.update(updateData, { id: id });
    return true;
  },
  searchEmployee: async (query) => {
    const searchCriteria = {
      status: "Active", // Ensure only active employees are fetched
    };

    // If 'firstName' is passed in the query, use it for searching
    if (query.first_name) {
      searchCriteria[Op.and] = [
        where(fn("LOWER", col("first_name")), {
          [Op.like]: `%${query.first_name.toLowerCase()}%`,
        }),
      ];
    }

    // Searching by joining_date
    // if (query.joining_date) {
    //   const year = parseInt(query.joining_date); // Convert to number
    //   if (!isNaN(year)) {
    //     searchCriteria.joining_date = {
    //       [Op.between]: [`${year}-01-01`, `${year}-12-31`], // Search within the year
    //     };
    //   }
    // }

    // Default pagination values
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 2;
    const offset = (page - 1) * limit;

    // Get paginated results
    const { rows: employees, count: totalEmployees } =
      // await employeeRepository.searchData(searchCriteria, limit, offset);
      await employeeRepository.getSearchEmployee(searchCriteria, limit, offset);

    // console.log(employees)
    return {
      employees,
      currentPage: page,
      totalPages: Math.ceil(totalEmployees / limit),
      totalEmployees,
    };
    // return employees;
  },
  searchIAEmployee: async (query) => {
    const searchCriteria = {
      status: "Inactive", // Ensure only active employees are fetched
    };

    // If 'firstName' is passed in the query, use it for searching
    if (query.first_name) {
      searchCriteria[Op.and] = [
        where(fn("LOWER", col("first_name")), {
          [Op.like]: `%${query.first_name.toLowerCase()}%`,
        }),
      ];
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 2;
    const offset = (page - 1) * limit;
    const { rows: employees, count: totalEmployees } =
      await employeeRepository.searchInActiveData(
        searchCriteria,
        limit,
        offset
      );

    return {
      employees,
      currentPage: page,
      totalPages: Math.ceil(totalEmployees / limit),
      totalEmployees,
    };
  },
  updateEmployeeTime: async (id, updateData) => {
    const employee = await employeeRepository.getDataById(id);
    if (!employee) {
      return false;
    }
    await employeeRepository.update(updateData, { id: id });
    return true;
  },
  updateEmployeeStatus: async (id, updateData) => {
    // Check if employee exists
    const employee = await employeeRepository.getDataById(id);

    if (!employee) {
      return false; // Employee not found
    }

    // Update employee status in the database
    await employeeRepository.update(updateData, { id: id });

    return true; // Return success
  },
  searchingbyredis: async (first_name, page, limit) => {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const searchFilters = [];

    // Handle one-letter search fallback to DB
    if (first_name) {
      if (first_name.length === 1) {
        // Fallback to DB for 1-letter search
        const employees = await Employee.findAll({
          where: {
            first_name: { [Op.like]: `%${first_name}%` },
          },
          attributes: ["id", "first_name"],
          raw: true,
          limit: pageSize,
          offset: offset,
        });

        return {
          data: employees,
          pagination: {
            totalItems: employees.length,
            totalPages: Math.ceil(employees.length / pageSize),
            currentPage: pageNumber,
            itemsPerPage: pageSize,
          },
        };
      } else {
        // Use RediSearch for multi-letter search
        searchFilters.push(`@first_name:${first_name.toLowerCase()}*`);
      }
    }

    try {
      let query = searchFilters.length > 0 ? searchFilters.join(" ") : "*";
      console.log("query", query);

      const hasEmployees = await redis.exists("employee:check");

      if (!hasEmployees) {
        console.log("🔁 Redis empty. Populating from DB...");

        const employees = await Employee.findAll({
          attributes: ["id", "first_name"],
          raw: true,
        });

        const pipeline = redis.multi();

        for (const emp of employees) {
          console.log("Inserting:", emp.id, emp.first_name);
          pipeline.call(
            "JSON.SET",
            `employee:${emp.id}`,
            "$",
            JSON.stringify({
              first_name: emp.first_name?.toLowerCase() || "",
            })
          );
        }

        await pipeline.exec();
        await redis.set("employee:check", "true");
      }

      // Skip index creation, directly perform the search.
      const redisResult = await redis.call(
        "FT.SEARCH",
        "idx:employee", // Make sure index 'idx:employee' is already created externally
        query,
        "LIMIT",
        offset.toString(),
        pageSize.toString()
      );

      console.log("Redis Result:", redisResult);

      const total = redisResult[0];
      const documents = [];

      for (let i = 1; i < redisResult.length; i += 2) {
        const docKey = redisResult[i];
        const rawArray = redisResult[i + 1];

        const jsonString = rawArray?.[1];

        if (jsonString) {
          try {
            const parsed = JSON.parse(jsonString);
            documents.push(parsed);
          } catch (err) {
            console.error("❌ JSON parse failed:", jsonString, err.message);
          }
        } else {
          console.warn("⚠️ Skipping invalid or missing JSON:", rawArray);
        }
      }

      return {
        data: documents,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / pageSize),
          currentPage: pageNumber,
          itemsPerPage: pageSize,
        },
      };
    } catch (err) {
      console.error("🔍 RedisSearch failed:", err.message);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: pageNumber,
          itemsPerPage: pageSize,
        },
      };
    }
  },

  updateEmployees: async (data) => {
    try {
      const { id, ...restFields } = data;
      if (!id) {
        return {
          success: false,
          message: "ID is required to update employee.",
        };
      }
      const employee = await Employee.findByPk(id);
      if (!employee) {
        return { success: false, message: "Employee not found." };
      }
      const newdata = await employee.update(restFields);
      await redis.json.set(`employee:${id}`, "$", {
        id,
        ...newdata,
      });
      return {
        success: true,
        message: "Employee updated successfully in DB and Redis.",
      };
    } catch (err) {
      console.error(" Update Error:", err.message);
      return {
        success: false,
        message: "Something went wrong during update.",
      };
    }
  },

  markEmployeesPresent: async (employeeIds, dates) => {
    for (const employee_id of employeeIds) {
      for (const date of dates) {
        await EmployeeAttendanceRepository.markEmployeeAttendance(
          employee_id,
          date,
          'present'
        );
      }
    }
  },

  markAllEmployeesPresent: async (dates) => {
    try {
      if (!Array.isArray(dates) || dates.length === 0) {
        throw new customError("No dates provided.");
      }

      const employees = await Employee.findAll({
        where: {
          status: 'Active'
        }
      });

      if (!employees || employees.length === 0) {
        throw new customError("No employees found.");
      }

      const attendanceRecords = [];

      for (const date of dates) {
        for (const employee of employees) {
          attendanceRecords.push({
            employee_id: employee.id,
            attendence_date: date,
            status: 'present',
          });
        }
      }
      console.log(attendanceRecords, "attendanceRecords");

      // Insert all records, skipping duplicates
      await EmployeeAttendence.bulkCreate(attendanceRecords, {
        ignoreDuplicates: true,
        fields: ['employee_id', 'attendence_date', 'status'], // ✅ Explicit fields
      });

      // Prepare attendance records
      console.log(`${attendanceRecords.length} attendance records processed.`);
    } catch (error) {
      console.error("Failed to mark all employees present:", error.message);
      throw error;
    }
  },


  createEmpBatch: async (employee_id, batch_id, session_Id) => {
    // 1. Validate if employee exists
    const employee = await employeeRepository.getDataById(employee_id);
    if (!employee) throw new customError("Employee not found");

    // 2. Validate if batch exists
    const batch = await batchRepository.getDataById(batch_id);
    if (!batch) throw new customError("Batch not found");

    // 3. Validate if session exists
    const session = await sessionRepository.getDataById(session_Id);
    if (!session) throw new customError("Session not found");

    // 4. Check if assignment already exists
    const existing = await empBatchRepository.findOne({
      employee_id,
      batch_id,
      session_Id,
    });

    if (existing) {
      return { exists: true };
    }

    // 5. Create new assignment
    const data = await empBatchRepository.create({
      employee_id,
      batch_id,
      session_Id,
    });

    return { exists: false, data };
  },

  createEmpSubj: async (data) => {
    const { employee_id, subject_id, session_Id, course_id } = data;

    // Check if employee exists
    const employee = await employeeRepository.getDataById(employee_id);
    if (!employee) throw new customError("Employee not found");

    // Check if subject exists
    const subject = await subjectRepository.getDataById(subject_id);
    if (!subject) throw new customError("Subject not found");

    // Check if session exists
    const session = await sessionRepository.getDataById(session_Id);
    if (!session) throw new customError("Session not found");

    // Optional: Check if course exists
    const course = await courseRepository?.getDataById?.(course_id);
    if (!course) throw new customError("Course not found");

    const isSubjectInCourse = await subjectCourseRepository.findOne({
      subject_id,
      course_id,
    });

    if (!isSubjectInCourse) {
      throw new customError("Subject does not belong to the specified course");
    }

    // Check for duplicate assignment
    const alreadyAssigned = await empSubjRepository.findOne({
      employee_id,
      subject_id,
      session_Id,
      course_id,
    });

    if (alreadyAssigned) {
      return { exists: true };
    }

    // Create assignment
    const created = await empSubjRepository.create({
      employee_id,
      subject_id,
      session_Id,
      course_id,
    });

    if (!created) {
      throw new customError("Failed to assign subject");
    }

    return { exists: false, data: created };
  },



  assignEmployee: async (data) => {
    const {
      batch_id: batchIds,
      subjectId: subjectIds,
      course_id,
      employeeId,
      session_Id, // ✅ new field
    } = data;

    const course = await courseRepository.findOne({ id: course_id });
    if (!course || course.status === "inactive") {
      throw new customError(`Course is inactive`, 400);
    }

    const session = await sessionRepository.findOne({ id: session_Id });
    if (!session || session.status === "inactive") {
      throw new customError(`Session is inactive or not found`, 400);
    }

    const validBatches = await batchRepository.findAll({
      id: { [Op.in]: batchIds },
      course_id,
      status: "active",
    });

    if (validBatches.length !== batchIds.length) {
      throw new customError(`One or more Batches are inactive or do not belong to the Course`, 400);
    }

    const validSubjects = await subjectCourseRepository.findAll({
      subject_id: { [Op.in]: subjectIds },
      course_id,
    });

    if (validSubjects.length !== subjectIds.length) {
      throw new customError(`One or more Subjects do not belong to the Course`, 400);
    }

    const activeSubjects = await subjectRepository.findAll({
      id: { [Op.in]: subjectIds },
      status: "active",
    });

    if (activeSubjects.length !== subjectIds.length) {
      throw new customError(`One or more Subjects are inactive`, 400);
    }

    const alreadyAssignedBatches = await empBatchRepository.findAll({
      employee_id: employeeId,
      batch_id: { [Op.in]: batchIds },
      session_Id, // ✅ check within session context
    });

    if (alreadyAssignedBatches.length > 0) {
      throw new customError(`One or more Batches already assigned to the Employee for this Session`, 400);
    }

    const alreadyAssignedSubjects = await empSubjRepository.findAll({
      employee_id: employeeId,
      subject_id: { [Op.in]: subjectIds },
      session_Id, // ✅ check within session context
    });

    if (alreadyAssignedSubjects.length > 0) {
      throw new customError(`One or more Subjects already assigned to the Employee for this Session`, 400);
    }

    const empBatchData = batchIds.map((batchId) => ({
      employee_id: employeeId,
      batch_id: batchId,
      session_Id, // ✅ include in insert
    }));

    const empSubjectData = subjectIds.map((subjectId) => ({
      employee_id: employeeId,
      subject_id: subjectId,
      course_id,
      session_Id, // ✅ include in insert
    }));

    await Promise.all([
      empBatchRepository.insertMany(empBatchData),
      empSubjRepository.insertMany(empSubjectData),
    ]);
  },


  getEmployeeBatchSubject: async (id) => {

    // let checkBatch = await empBatchRepository.getOneData({ employee_id: id });
    // if (!checkBatch) {
    //   throw new customError("Employee not found", 404);
    // }
    // let checkSubject = await empSubjRepository.getOneData({ employee_id: id });
    // if (!checkSubject) {
    //   throw new customError("Employee not found", 404);
    // }
    return await employeeRepository.getEmployeeBatchSubject(id);
  },
  deleteEmployeeBatchSubject: async (data) => {
    const { batch_id, subject_id, employee_id } = data;

    if (batch_id) {
      const checkBatch = await empBatchRepository.getOneData({ batch_id, employee_id });
      if (!checkBatch) {
        throw new customError("Batch not assigned to this employee", 404);
      }
      await empBatchRepository.deleteAssignBatch(batch_id);
    }

    if (subject_id) {
      const checkSubject = await empSubjRepository.getOneData({ subject_id, employee_id });
      if (!checkSubject) {
        throw new customError("Subject not assigned to this employee", 404);
      }
      return await empSubjRepository.deleteAssignSubject(subject_id);
    }
  },

  searchemp: async (first_name, attendence_date, page, limit, status) => {
    // Fetch all matching records
    console.log("services file code : ", attendence_date);
    const attendenseapi = await EmployeeAttendanceRepository.employeseacrhing(attendence_date, first_name);

    if (!attendenseapi || !Array.isArray(attendenseapi.data) || attendenseapi.data.length === 0) {
      throw new Error("No attendance data found.");
    }

    let allAttendance = attendenseapi.data;

    if (status && status.trim() !== "") {

      const filterStatus = status.trim().toLowerCase();

      allAttendance = allAttendance.filter(item => {
        // Null check & case insensitive compare
        return item.status && item.status.trim().toLowerCase() === filterStatus;
      });

      if (allAttendance.length === 0) {
        throw new Error(`No attendance data found for status: ${status}`);
      }
    }

    // Calculate total Present, Half Day, Absent based on filtered data
    let totalPresent = allAttendance.filter(item => item.status && item.status.trim().toLowerCase() === 'present').length;
    let totalHalfDay = allAttendance.filter(item => item.status && item.status.trim().toLowerCase() === 'half_day').length;
    let totalAbsent = allAttendance.filter(item => item.status && item.status.trim().toLowerCase() === 'absent').length;

    // Extract unique attendance dates
    const uniqueDates = [...new Set(allAttendance.map(item => item.attendence_date))].sort();

    // Calculate total working days excluding Sundays
    let totalWorkingDays = 0;
    if (uniqueDates.length > 0) {
      const start = moment(uniqueDates[0]);
      const end = moment(uniqueDates[uniqueDates.length - 1]);
      let current = start.clone();

      while (current.isSameOrBefore(end)) {
        if (current.day() !== 0) { // Exclude Sundays
          totalWorkingDays++;
        }
        current.add(1, 'days');
      }
    }

    // Pagination logic
    const totalEmployees = allAttendance.length;
    const totalPages = Math.ceil(totalEmployees / limit);
    const currentPage = parseInt(page) || 1;

    const paginatedData = allAttendance.slice((currentPage - 1) * limit, currentPage * limit);

    if (paginatedData.length === 0 && currentPage > 1) {
      throw new Error("No data found for the requested page.");
    }

    // Final Response
    return {
      paginatedData,
      totalPresent,
      totalHalfDay,
      totalAbsent,
      totalWorkingDays,
      pagination: {
        totalItems: totalEmployees,
        totalPages,
        currentPage,
        itemsPerPage: limit,
      },
    };
  },


  saveEmployeeInExcelServices: async (attendance_date) => {
    try {
      console.log("👉 Exporting Attendance for Date:", attendance_date);

      // ✅ Fetch attendance data by date
      const attendanceData = await EmployeeAttendanceRepository.employeseacrhing(attendance_date);

      if (!attendanceData || !attendanceData.data || attendanceData.data.length === 0) {
        throw new customError("No attendance data found for the selected date.");
      }

      // ✅ Step 1: Create Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance");

      // ✅ Step 2: Define worksheet columns
      worksheet.columns = [
        { header: "S.No", key: "s_no", width: 10 },
        { header: "Employee Name", key: "name", width: 25 },
        { header: "Employee Email", key: "email", width: 30 },
        { header: "Employee Status", key: "employee_status", width: 20 },
        { header: "Attendance Date", key: "date", width: 15 },
        { header: "Attendance Status", key: "status", width: 15 },
        { header: "In Time", key: "in_time", width: 15 },
        { header: "Out Time", key: "out_time", width: 15 },
      ];

      // ✅ Step 3: Add data rows to worksheet
      attendanceData.data.forEach((entry, index) => {
        worksheet.addRow({
          s_no: index + 1,
          name: entry.Employee?.first_name || "N/A",
          email: entry.Employee?.email || "N/A",
          employee_status: entry.Employee?.status || "N/A",
          date: attendance_date,
          status: entry.status,
          in_time: entry.in_time || "00:00:00",
          out_time: entry.out_time || "00:00:00",
        });
      });

      // ✅ Step 4: Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      console.log("✅ Excel file generated successfully.");
      return buffer;

    } catch (error) {
      console.error("🔥 Error in saveEmployeeInExcelServices:", error.message);
      throw error;
    }
  },

  getActiveEmp: async () => {
    const activeEmployees = await employeeRepository.getAllWithCondition({
      status: "Active",
    }, ['id', 'first_name']);

    if (!activeEmployees || activeEmployees.length === 0) {
      throw new customError("No active employees found", 404);
    }

    return activeEmployees;
  },


};

module.exports = employeeService;
