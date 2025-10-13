const express = require("express");
const batchesController = require("../../controllers/Batches.controller");
const authenticate = require("../../middleware/admin.auth");
const batchrouter = express.Router();

batchrouter.post("/addbatch", authenticate, batchesController.addbatch);
batchrouter.get(
  "/getallbatchescontroller", authenticate,
  batchesController.getallbatchescontroller
);
batchrouter.patch("/deletebatchescontroller", authenticate, batchesController.updateBatchStatusController
);
batchrouter.put("/batchupdate", authenticate, batchesController.batchupdatecontroller);
batchrouter.put("/timeupdate", authenticate, batchesController.timeupdate);
batchrouter.get("/searching", authenticate, batchesController.searching);

batchrouter.get(
  "/getBatchByCourseIdController/:id", authenticate,
  batchesController.getBatchByCourseIdController
);
batchrouter.get(
  "/coursestudentcontroller/:id", authenticate,
  batchesController.coursestudentcontroller
);
batchrouter.put("/updatebatchfildes", authenticate, batchesController.updatebatchfildes);

batchrouter.get("/batch/:id", authenticate, batchesController.getBatchById);
module.exports = batchrouter;
