/**********************************************************************
 *  PAYMENT-RECEIPT CONTROLLER
 *********************************************************************/
const { try_catch } = require("../utils/tryCatch.handler");
const customError = require("../utils/error.handler");
const PaymentReceiptService = require("../services/receipt.service");
const { getBlob, deleteAllBlobs } = require("../utils/azureUploader");

const receipt = {
  /** GET /receipt/:emi_id  →  returns the PDF binary as a download. */
  downloadReceipt: try_catch(async (req, res) => {
    const { id } = req.params;
    if (!id) throw new customError("EMI ID is required", 400);

    /* 1. Gather student/course/emi info */
    // const studentData = await PaymentReceiptService.downloadReceipt({ emi_id });

    /* 2. Build / upload the PDF if it isn’t already on Azure */
    const fileName  = await PaymentReceiptService.createReceipt(
     id
    );
// console.log(fileName);

    // let data =await  PaymentReceiptService.downloadReciept(id)
// console.log(fileName);
// return 
    /* 3. Stream the blob down to the client */
    const blob = await getBlob(`receipts/${fileName}`);
    const stream = blob.readableStreamBody;
    if (!stream) throw new customError("Failed to read blob stream", 500);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // handle possible stream errors so the request doesn’t hang
    stream.on("error", (err) => {
      console.error("Blob stream errored:", err);
      if (!res.headersSent) res.status(500).end();
    });

    stream.pipe(res);
  }),
  deleteAllBlobsController: async (req, res) => {
    await deleteAllBlobs();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "All blobs deleted successfully",
    });
  },
};

module.exports = { receipt };
