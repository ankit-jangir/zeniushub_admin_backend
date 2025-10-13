const express = require('express');
const employeeSubjectController = require('../../controllers/employeeSubject.controller');
const authenticate = require('../../middleware/admin.auth');
const employeeSubjectRoute = express.Router();


employeeSubjectRoute.post("/addEmployeeSubject", authenticate, employeeSubjectController.addemployeeSubject);
employeeSubjectRoute.get("/getEmployeeSubject/:employeeId", authenticate, employeeSubjectController.getEmployeeSubject);
employeeSubjectRoute.get("/unassignedSubjects/:employeeId", authenticate, employeeSubjectController.getEmployeeNonAddingSubject);
employeeSubjectRoute.delete("/:id", authenticate, employeeSubjectController.delEmployeeSubj);

module.exports = { employeeSubjectRoute }