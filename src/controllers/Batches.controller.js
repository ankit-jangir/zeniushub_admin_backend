const batchesServies = require("../services/Batches.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const batchesController = {


  addbatch: try_catch(async (req, res) => {
    const data = req.body;
    console.log(data)
    if (
      !data.course_id ||
      !data.BatchesName ||
      // !data.StartDate ||
      // !data.EndDate ||
      !data.StartTime ||
      !data.EndTime
    ) {
      throw new customError("All fields are required", 400);
    }

    const newBatch = await batchesServies.addbatchservies(data);
    if (!newBatch) {
      throw new customError("Failed to create batch", 400);
    }
    res.status(201).json({
      status: "success",
      message: "Batch created successfully",
      data: newBatch,
    });
  }),

  getallbatchescontroller: try_catch(async (req, res) => {
    const { batchName = "",course_id, page = 1, limit = 10 } = req.query;

    const data = await batchesServies.getallbatchesservices(batchName,course_id, page, limit);

    res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      ...data, // returns { totalPages, currentPage, data }
    });
  }),

  updateBatchStatusController: try_catch(async (req, res) => {
    const { id } = req.query;

    if (!id) {
      return res
        .status(400)
        .json({ message: "batchId query parameter is required" });
    }

    const batch = await batchesServies.updateStatus(id);

    return res.status(200).json({
      success: true,
      message: "Batch status toggled successfully",
      data: batch,
    });
  }),

  batchupdatecontroller: try_catch(async (req, res) => {
    const { id } = req.body;
    const data = await batchesServies.batchupdate(req.body);
    if (!data) {
      throw new customError("All fields are required", 400);
    }
    res.status(201).json({
      status: "success",
      message: "Batch Update successfully : ",
      data: data,
    });
  }),


  
  timeupdate: try_catch(async (req, res) => {
    const data = await batchesServies.timeupdate(req.query);
    if (!data) {
      throw new customError("All fields are required", 400);
    }
    res.status(201).json({
      status: "success",
      message: "Time Update successfully : ",
      data: data,
    });
  }),
  searching: try_catch(async (req, res) => {
    const { BatchesName, page = 1, limit = 10, status } = req.query;

    const data = await batchesServies.searchingbatch({
      BatchesName,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      message: "Batch list fetched successfully",
      ...data,
    });
  }),

  getBatchByCourseIdController: try_catch(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      throw new customError("Course ID is required.", 400);
    }

    const batchId = parseInt(id);

    const batchData = await batchesServies.getBatchByCourseIdService(batchId);

    // if (!batchData.batches || batchData.batches.length === 0) {
    //   throw new customError("No batch data found for the given course ID.", 404);
    // }

    res.status(200).json({
      status: "success",
      message: "Batch data retrieved successfully",
      data: batchData,
    });
  }),

  coursestudentcontroller: try_catch(async (req, res) => {
  const batchId = req.params.id;
  const sessionId = req.query.session_id; // 🔍 query से पकड़ो

  if (!sessionId) {
    throw new customError("Session ID is required", 400);
  }

  const data = await batchesServies.coursestudent(batchId, sessionId);

  res.status(200).json({
    status: "success",
    message: "Batch data retrieved successfully",
    data,
  });
}),

  updatebatchfildes: try_catch(async (req, res) => {
    const data = await batchesServies.updatebatchfildes(req.body);
    res.status(200).json({
      status: "success",
      message: "Batch data update successfully",
      data: data,
    });
  }),
  getBatchById: try_catch(async (req, res) => {
    const { id } = req.params;

    const batch = await batchesServies.getBatchById(id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Batch fetched successfully",
      data: batch,
    });
  }),
};

module.exports = batchesController;
