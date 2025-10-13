const express = require("express");
const { receipt } = require("../../controllers/receipt");
const authenticate = require("../../middleware/admin.auth");
// const { downloadReceipt } = require('../../controllers/receipt');
const receiptRouter = express.Router();

receiptRouter.get("/generate/:id", authenticate, receipt.downloadReceipt);
// receiptRouter.delete("/blobs",receipt.deleteAllBlobsController);

module.exports = receiptRouter;
