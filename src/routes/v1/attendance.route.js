const express = require("express");
const { studentAttendance } = require("../../controllers/attendence.controller");
const authenticate = require("../../middleware/admin.auth");
// const studentcontroller = require("../../controllers/attendence.controller");
const attendanceroute = express.Router();

attendanceroute.post("/check-in/:enrollment_id", authenticate, studentAttendance.checkIn);
attendanceroute.post("/attendance/check-out/:enrollment_id", authenticate, studentAttendance.checkOut);
attendanceroute.get("/getstudent", authenticate, studentAttendance.getFilteredAttendance)
attendanceroute.get("/getsinglestudent", authenticate, studentAttendance.getStudentAttendance)
attendanceroute.post("/exportdatainExcel", authenticate, studentAttendance.exportdatainExcel)



module.exports = { attendanceroute };
