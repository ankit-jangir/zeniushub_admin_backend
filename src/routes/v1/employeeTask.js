const express = require("express");
const { employeeTask } = require("../../controllers/employeeTask");
const getMulterConfig = require("../../utils/file.handler");
const authenticate = require("../../middleware/admin.auth");
const multerErrorHandler = require("../../utils/multerHandler");
const employeeTaskRoute = express.Router();


const pdfUpload = getMulterConfig(/pdf/);

employeeTaskRoute.post("/add", authenticate, pdfUpload.single('attachments'), employeeTask.addEmployeeTask);
employeeTaskRoute.get("/get", authenticate, employeeTask.getAllTask);
employeeTaskRoute.get("/getbyemployee_id/:employee_id", authenticate, employeeTask.getEmployeeTask);
employeeTaskRoute.get("/getbyid/:id", authenticate, employeeTask.getEmployeeTaskById);
employeeTaskRoute.patch("/update", authenticate, multerErrorHandler(pdfUpload.single('attachments')), employeeTask.updateEmployeeTask);
employeeTaskRoute.delete("/delete/:id", authenticate, employeeTask.deleteEmployeeTask);
employeeTaskRoute.get("/countbyemployee_id/:employee_id", authenticate, employeeTask.countEmployeeTask);
employeeTaskRoute.get("/count", authenticate, employeeTask.countAllTask);
employeeTaskRoute.patch("/status/update", authenticate, employeeTask.updateStatus);

module.exports = { employeeTaskRoute }
