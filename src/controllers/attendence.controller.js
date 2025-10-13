const attendanceservice = require("../services/attendance.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const studentAttendance = {
  checkIn: try_catch(async (req, res) => {
    const { enrollment_id } = req.params;
    console.log("11111111111", req.params);

    const result = await attendanceservice.checkIn(enrollment_id);
    res.status(result.success ? 201 : 404).json(result);
  }),

  checkOut: try_catch(async (req, res) => {
    const { enrollment_id } = req.params;
    const result = await attendanceservice.checkOut(enrollment_id);
    res.status(result.success ? 200 : 400).json(result);
  }),

//  getFilteredAttendance: try_catch(async (req, res) => {
//   if (!req.query.sessionId) {
//     throw new customError("Missing required field: sessionId", 400);
//   }

//   const data = await attendanceservice.getFilteredAttendance(req.query);

//   if (!data) {
//     throw new customError("No attendance records found.", 404);
//   }

//   res.status(200).json({
//     success: true,
//     message: "Filtered attendance fetched successfully",
//     data,
//   });
// }),

getFilteredAttendance: try_catch(async (req, res) => {
  console.log(req.query,"****************************** req.query")
  if (!req.query.sessionId) {
    throw new customError("Missing required field: sessionId", 400);
  }

  const result = await attendanceservice.getFilteredAttendance(req.query);

  if (!result || result.total === 0) {
    throw new customError("No attendance records found.", 404);
  }

  const { data, ...meta } = result;

  res.status(200).json({
    success: true,
    message: "Filtered attendance fetched successfully",
    ...meta, // ✅ spread meta keys
    data,    // ✅ send data array directly
  });
}),


 getStudentAttendance : try_catch(async (req, res) => {
  const { enrollmentId ,month, year } = req.query;
  console.log(req.query);
 
  // Validate required fields
  if (!month || !year) {
    return res.status(400).json({
      message: "'month' and 'year' are required to fetch attendance data",
    });
  }

  if (isNaN(month) || isNaN(year)) {
    return res.status(400).json({
      message: "'month' and 'year' must be valid numbers",
    });
  }

  if (month < 1 || month > 12) {
    return res.status(400).json({
      message: "'month' must be between 1 and 12",
    });
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return res.status(400).json({
      message: "'year' must be a valid year between 1900 and the current year",
    });
  }

  if (!enrollmentId) {
    return res.status(400).json({
      message: "Enrollment ID is required",
    });
  }

  const attendance = await attendanceservice.getStudentAttendance(
    enrollmentId,
    parseInt(month),
    parseInt(year)
  );

  return res.status(200).json({
    success: true,
    message: "Successfully fetched student attendance",
    data: attendance,
  });
}),


  exportdatainExcel: try_catch(async (req, res) => {
    const { from, to, Batch_id } = req.body;
    if (!from || !to || !Batch_id) {
      return res.status(400).json({ error: "from, to, and Batch_id are required fields." });
    }
    const excelBuffer = await attendanceservice.exportdatainExcelServices({
      from,
      to,
      Batch_id,
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance.xlsx"
    );
    res.send(excelBuffer);
  }),
};

module.exports = { studentAttendance };
