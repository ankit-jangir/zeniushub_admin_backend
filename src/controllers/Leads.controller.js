const Leadsservices = require("../services/Leads.Service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const leadSchema = require("../validators/Leads.Validators");

const leadscontroller = {
  addleadscontroller: try_catch(async (req, res) => {
  const result = await Leadsservices.addleadsservices(req.body);

  if (!result.status) {
    // validation failed or any error in service
    return res.status(400).json({
      status: false,
      message: result.message || "Validation error",
    });
  } 
  res.status(201).json({
    status: true,
    message: "Leads created successfully",
    data: result.data,
  });
}),

  getallLeadscontroller: try_catch(async (req, res) => {
    // Destructure page, limit, and other criteria (including session_id)
    const { page = 1, limit = 10, session_id, ...getCritieria } = req.query;

    // Validate if session_id exists
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required",
      });
    }

    // Validate that session_id is a valid format (adjust regex as needed)
    if (!/^[a-zA-Z0-9-]+$/.test(session_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session_id format",
      });
    }

    // Parse page and limit to integers and validate their ranges
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number, it must be a positive integer.",
      });
    }

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit, it must be a positive integer.",
      });
    }

    // Include session_id in the filter criteria
    getCritieria.session_id = session_id;

    try {
      // Pass the updated getCritieria, page, and limit to the service
      const leads = await Leadsservices.getAllLeadsServices(
        getCritieria,
        parsedPage,
        parsedLimit
      );

      res.status(200).json({ success: true, data: leads });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching leads",
          error: error.message,
        });
    }
  }),

  deleteLeadscontroller: try_catch(async (req, res) => {
    const data = await Leadsservices.deleteLeadsservices(req.params.id);
    res.status(201).json({
      status: "success",
      message: "delete Leads successfully ",
      data: data,
    });
  }),
  filterleadsstatuscontroller: try_catch(async (req, res) => {
    console.log(req.params.status);
    // const myData = {
    //     "status":req.params.status
    // }
    const data = await Leadsservices.filterleadsstatusServices(
      req.params.status
    );
    console.log(data);

    res.status(201).json({
      status: "success",
      message: "get all Leads :    ",
      data: data,
    });
  }),
  FilterCategoryController: try_catch(async (req, res) => {
    const data = await Leadsservices.FilterCategoryServices(
      req.params.category_id
    );
    res.status(201).json({
      status: "success",
      message: "get all Leads :    ",
      data: data,
    });
  }),
  // searchingleadsController : try_catch(async(req,res)=>{
  //     const {name,email,phone_number,assign_to} = req.body
  //     const data = await Leadsservices.searchingleadsService(name,email,phone_number,assign_to)
  //     res.status(201).json({
  //         status: "success",
  //         message: "get all Leads :    ",
  //         data: data
  //     });
  // }),
  searchingleadsController: try_catch(async (req, res) => { 
const {name,status,page,limit} = req.query
    const data = await Leadsservices.searchingleadsService(req.query,page,limit);
// console.log(page)
    res.status(201).json({
      status: "success",
      message: "get all Leads",
      data: data,
    });
  }),

  changestatusLeadsController: try_catch(async (req, res) => {
    const { id, status } = req.body;
    console.log(id, status);

    const data = await Leadsservices.changestatusLeads(id, status);
    res.status(201).json({
      status: "success",
      message: "get all Leads :    ",
      data: data,
    });
  }),
  changeAssineTaskLeadscontroller: try_catch(async (req, res) => {
    const { id, assign_to } = req.body;
    const data = await Leadsservices.changeAssineTaskLeads(id, assign_to);
    res.status(201).json({
      status: "success",
      message: "get all Leads :    ",
      data: data,
    });
  }),
  filterAndSearchLeadsController: try_catch(async (req, res) => {
    // const {status, category_id, name, email, phone_number, assign_to, page, pageSize} =req.body
    const data = await Leadsservices.filterAndSearchLeads(req.body);
    res.status(201).json({
      status: "success",
      message: "get all Leads :    ",
      data: data,
    });
  }),
  getLeadsStatusSummary: try_catch(async (req, res) => {
    const result = await Leadsservices.getLeadsStatusSummary(req.query.id);
    res.status(200).json({
      success: true,
      message: "Lead status summary fetched successfully",
      data: result,
    });
    
  }),








  converttostudent:try_catch(async(req,res)=>{
    const {leadsId,courseId,batchId,adhar_no,gender,father_name,mother_name,dob} = req.body
    const data = await Leadsservices.converttostudentServices(leadsId,courseId,batchId,adhar_no,gender,father_name,mother_name,dob);
    res.status(200).json({
      success: true,
      message: "Lead status summary fetched successfully",
      data: data,
    });
  })
};
module.exports = leadscontroller;
