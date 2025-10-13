const express = require("express");
const getallemployesss = require("../../controllers/Dashboard.controller");
const authenticate = require("../../middleware/admin.auth");
const Desboardservice = express.Router();

Desboardservice.get("/getallemployesss", authenticate, getallemployesss.getemp);
Desboardservice.get(
  "/Departmentcontroller", authenticate,
  getallemployesss.Departmentcontroller
);
Desboardservice.get("/emicontroller", authenticate, getallemployesss.emicontroller);
Desboardservice.get(
  "/studentsAttendancecontroller", authenticate,
  getallemployesss.studentsAttendancecontroller
);
Desboardservice.get("/reaildata", authenticate, getallemployesss.reaildata);
Desboardservice.get("/countAcademics", authenticate, getallemployesss.getCounts);

module.exports = Desboardservice;
