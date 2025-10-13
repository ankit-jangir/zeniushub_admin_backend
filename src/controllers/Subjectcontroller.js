const { Subjectservice } = require("../services/Subjectservice");
const customError = require("../utils/error.handler");

const { try_catch } = require("../utils/tryCatch.handler");

const subjectcontroller = {
  addsubject: try_catch(async (req, res) => {
    // const { subject_name,course_id } = req.body;

    if (!req.body.subject_name || !req.body.course_id) {
      throw new customError("all fields is required.", 400);
    }
    const data = await Subjectservice.addsubject(req.body);
    
    if (!data) {
      throw new customError("Failed to add subject.", 500);
    }
    res.status(200).json({
      status: "success",
      data: data,
    });
  }),
  updatebysubjectnamecontroller: try_catch(async (req, res) => {
    const { id, subject_name,course_id } = req.body; // ✅ Frontend se data extract kiya

    if (!id || !subject_name) {
      throw new customError("ID and Subject name are required.", 400);
    }

    const data = await Subjectservice.updatebysubjectnameservice(
      id,
      subject_name,
      course_id
    );
    
    // if (!data || data[0] === 0) {
    //   throw new customError("Failed to update subject.", 500);
    // }

    res.status(200).json({
      status: "success",
      message: "Subject updated successfully",
      data: data,
    });
  }),
  deletesubjectcontroller: try_catch(async (req, res) => {
    const { id } = req.query;
    // if (!id) {
    //   throw new customError("ID are required.", 400);
    // }
    const data = await Subjectservice.deletesubjectservices(id);
    // if (!data) {
    //   throw new customError("Failed to delete subject.", 400);
    // }
    res.status(200).json({
      status: "success",
      message: "Subject deleted successfully",
      data: data,
    });
  }),
  
 getallsubjectcontroller: try_catch(async (req, res) => {
  const { search = "", page, limit } = req.query;

  const data = await Subjectservice.getallsubjectservice(search, page, limit);
  if (!data) {
    throw new customError("Failed to fetch subjects.", 400);
  }

  res.status(200).json({
    status: "success",
    message: "Subjects retrieved successfully",
    data: data.data,
    meta: data.meta,
  });
})
,
  searchbysubjectnamecontroller: try_catch(async (req, res) => {
    const { search = '', page = 1, limit = 10 } = req.query;

    const result = await Subjectservice.searchbysubjectnameservices(search, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  }),
};

module.exports = { subjectcontroller };
