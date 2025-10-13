const express = require('express');
const employeeSalaryRouter = express.Router();
const { getSalary } = require('../../controllers/employeeSalary.controller');
const authenticate = require('../../middleware/admin.auth');

employeeSalaryRouter.get('/',authenticate, getSalary);

module.exports = employeeSalaryRouter;