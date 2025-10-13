const DashboardService = require("../services/Dashboard.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const getallemployesss = {
  getemp: try_catch(async (req, res) => {
    const data = await DashboardService.getEmployee(req.query.session_id);

    
  return  res.status(200).json({
      status: "success",
      data: {
        data: data,
      },
    });
  }),
  Departmentcontroller: try_catch(async (req, res) => {
    const data = await DashboardService.department();
    res.status(200).json({
      status: "success",
      data: {
        data: data,
      },
    });
  }),
  // controllers/emicontroller.js
  // emicontroller: try_catch(async (req, res) => {
  //     const { session_id } = req.query;

  //     const data = await DashboardService.Emiservices(Number(session_id));

  //     res.status(200).json({
  //       status: "success",
  //       message: `EMI data for session ID ${session_id}`,
  //       data,
  //     });
  //   }),
  emicontroller: async (req, res) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ message: "session_id is required" });
    }

    try {
      const emiData = await DashboardService.getEmiDataForSession(sessionId);
    return res.status(200).json({
      status: "success",
      message: `EMI data for session ID ${sessionId}`,
      data: emiData || [],
    });


   
    } catch (error) {
      console.error("Error in getEmiData controller:", error);
      return res
        .status(500)
        .json({
          message: "An error occurred while fetching EMI data",
          error: error.message,
        });
    }
  },
  // studentpdfcontroller : try_catch(async(req,res)=>{
  //     const data = await DashboardService.studentService(req.body)
  //     res.status(200).json({
  //         status:"success",
  //         data:{
  //             data:data
  //         }
  //     })
  // }),
  studentsAttendancecontroller: try_catch(async (req, res) => {
    const data = await DashboardService.studentsAttendanceServices();
    res.status(200).json({
      status: "success",
      data: data,
    });
  }),
  reaildata: try_catch(async (req, res) => {
    const data = await DashboardService.reaaildata();
    res.status(200).json({
      status: "success",
      data: data,
    });
  }),

 getCounts : async (req, res) => {
  const data = await DashboardService.getCounts();

  return res.status(200).json({
    success: true,
    data,
  });
},

};
module.exports = getallemployesss;
