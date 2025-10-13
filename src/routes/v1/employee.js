const express = require("express");
const employeeController = require("../../controllers/emplyee");
const validatePagination = require("../../middleware/validatePaginaction.middleware");
const authenticate = require("../../middleware/admin.auth");
const getMulterConfig = require("../../utils/file.handler");
const employeeRoute = express.Router();

const imageUpload = getMulterConfig(/jpeg|jpg|png|webp|svg/)

employeeRoute.get("/get", authenticate, employeeController.getEmployee);

// Route to search for employees
employeeRoute.get("/search", authenticate, employeeController.searchEmployee); // Handles search queries

employeeRoute.get("/searchActiveEmployee", authenticate, employeeController.searchActiveEmployee); // Handles search queries

employeeRoute.get("/searchInActiveEmployee", authenticate, employeeController.searchInActiveEmployee); // Handles search queries

employeeRoute.get("/getOne/:id", authenticate, employeeController.getSingleEmployee);

employeeRoute.post("/add", authenticate, imageUpload.single('image_path'), employeeController.addEmployee);

// Add the new route for updating an employee
employeeRoute.put("/update/:id", authenticate, imageUpload.single('image_path'), employeeController.updateEmployee);

//update Employee Timing
employeeRoute.put("/updateTime/:id", authenticate, employeeController.updateEmployeeTiming)


employeeRoute.put("/updateEmployeeStatus/:id", authenticate, employeeController.updateEmployeeStatus)

employeeRoute.delete("/delete/:id", authenticate, employeeController.deleteEmployee); // Add this line

employeeRoute.post("/search", authenticate, validatePagination, employeeController.searchingbyrediController)


employeeRoute.post("/updateEmployeecontroller", authenticate, employeeController.updateEmployeecontroller)

employeeRoute.post("/emp_batch", authenticate, employeeController.createEmpBatch)
employeeRoute.post("/emp_subj", authenticate, employeeController.postEmpSubj)
employeeRoute.post("/assign", authenticate, employeeController.assignEmployee)

employeeRoute.post("/mark-present", authenticate, employeeController.markEmployeesPresent);// Mark attendance for an employee
employeeRoute.post("/markall-present", authenticate, employeeController.markAllPresent);// Mark attendance for all employees
employeeRoute.get("/getActiveEmp", authenticate, employeeController.getActiveEmp);
employeeRoute.get("/SearchActiveEmp", authenticate, employeeController.searchActiveEmployee);
employeeRoute.get("/saveactiveEmpwithdown", authenticate, employeeController.saveEmployeeInExcel);

employeeRoute.get("/assignbatchsubject/:employee_id", authenticate, employeeController.getEmployeeBatchSubject)
employeeRoute.get("/searchempcontroller", authenticate, employeeController.searchempcontroller)
employeeRoute.delete("/assignbatchsubjectdelete/", authenticate, employeeController.deleteEmployeeBatchSubject)
module.exports = { employeeRoute };
