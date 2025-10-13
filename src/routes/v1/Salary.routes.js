const express = require('express');
const deptSalary = express.Router();
const salaryController = require('../../controllers/Salary.controller');
const authenticate = require('../../middleware/admin.auth');

deptSalary.get('/department-wise-Count',authenticate, salaryController.getSalaryStatus);


deptSalary.get('/department-wise-salaries',authenticate, salaryController.getSalaryCount);


deptSalary.get('/salerycreatecontroller',authenticate, salaryController.salerycreatecontroller);



deptSalary.post('/salerycreateEmploye',authenticate, salaryController.salerycreateEmployecontroller);


deptSalary.get('/particularEmployeDetails',authenticate, salaryController.particularEmployeDetails);


deptSalary.get('/upcomingsaleryController',authenticate, salaryController.upcomingsaleryController);


module.exports = deptSalary;