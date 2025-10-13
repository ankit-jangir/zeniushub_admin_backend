const Emiservices = require("../services/emis.services");
const { try_catch } = require("../utils/tryCatch.handler");
const customError = require("../utils/error.handler");
const emiValidationSchema = require("../validators/emiValidator");
const ExcelJS = require("exceljs");
const emiValidationSchemaOne = require("../validators/emivalidatorOneshot");
const PaymentReceiptService = require("../services/receipt.service");
const { StatusCodes } = require("http-status-codes");
const { getBlob, deleteAllBlobs } = require("../utils/azureUploader");
const moment = require("../utils/time-zone");
const emiController = {
  // addEmi: try_catch(async (req, res) => {
  //   const resultValidation = emiValidationSchema.safeParse(req.body);

  //   if (!resultValidation.success) {
  //     throw new customError(
  //       resultValidation.error.errors.map((err) => err.message).join(", "),
  //       400
  //     );
  //   }

  //   const data = await Emiservices.addEmis(resultValidation.data);

  //   res.status(201).json({
  //     success: true,
  //     message: "EMI added successfully",
  //     data,
  //   });
  // }),

  addEmi: try_catch(async (req, res) => {
    /* Validate request body with Zod --------------------------------------- */
    // const parsed = emiValidationSchema.safeParse(req.body);
    // if (!parsed.success) {
    //   throw new customError(
    //     parsed.error.errors.map((e) => e.message).join(", "),
    //     StatusCodes.BAD_REQUEST
    //   );
    // }

    const result = await Emiservices.addEmis(req.body);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "EMI plan created successfully",
      data: result,
    });
  }),

  // addOneShotEmi: try_catch(async (req, res) => {
  //   // Add validation for consistency
  //   // const resultValidation = emiValidationSchema.safeParse(req.body);
  //   // if (!resultValidation.success) {
  //   //   throw new customError(
  //   //     resultValidation.error.errors.map((err) => err.message).join(", "),
  //   //     400
  //   //   );
  //   // }

  //   const data = await Emiservices.addOneShotEmi(req.body);
  //   res.status(201).json({ success: true, message: "One-shot EMI added successfully", data });
  // }),

  addOneShotEmi: try_catch(async (req, res) => {
    console.log("Request Body:", req.body);
    const resultValidation = emiValidationSchemaOne.safeParse(req.body);
    if (!resultValidation.success) {
      console.log("Validation Errors:", resultValidation.error);
      throw new customError(
        resultValidation.error.errors.map((err) => err.message).join(", "),
        400
      );
    }
    const data = await Emiservices.addOneShotEmi(resultValidation.data);
    console.log(data, "dataaa");

    return res.status(201).json({
      success: true,
      message: "One-shot EMI added successfully",
      data,
    });
  }),
  markEmiPaid: try_catch(async (req, res) => {
    // try {
    const emiId = req.params.id;
    const { is_paid } = req.body;
    console.log();

    if (typeof is_paid !== "boolean") {
      return res
        .status(400)
        .json({ message: "`is_paid` must be a boolean (true or false)" });
    }

    const updatedCount = await Emiservices.markEmiAsPaid(emiId, is_paid);

    if (updatedCount === 0) {
      return res
        .status(404)
        .json({ message: "EMI not found or update failed" });
    }

    return res
      .status(200)
      .json({ message: `EMI marked as ${is_paid ? "paid" : "unpaid"}` });
  }),

  getEmis: try_catch(async (req, res) => {
    const { month, year } = req.query;

    if (month === undefined || year === undefined) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required in query params",
      });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (
      isNaN(parsedMonth) ||
      isNaN(parsedYear) ||
      parsedMonth < 0 ||
      parsedMonth > 11
    ) {
      return res.status(400).json({
        success: false,
        message: "Month must be a number between 0 and 11. Year must be valid.",
      });
    }

    const data = await Emiservices.getEmis({ query: req.query });

    return res
      .status(200)
      .json({ success: true, message: "EMIs retrieved successfully", data });
  }),

  getEmisTotalAmounts: try_catch(async (req, res) => {
    const result = await Emiservices.getEmisTotalAmounts(req);
    res.status(200).json({
      success: true,
      message: "EMI total amounts retrieved successfully",
      data: result,
    });
  }),

  // getOneStudentPayment : try_catch(async(req,res)=>{
  //   const {id} = req.body
  //   console.log(id);

  //   const result = await Emiservices.getOneStudentPaymenthistory(id);
  //   res.status(200).json({ success: true, message: "EMI total amounts retrieved successfully", data: result });
  // }),
  getOneStudentPayment: try_catch(async (req, res) => {
    const { id } = req.query;
    console.log(id);

    const result = await Emiservices.getOneStudentPaymenthistory(id);
    res.status(200).json({
      success: true,
      message: "EMI total amounts retrieved successfully",
      data: result,
    });
  }),

  getFilteredEmis: try_catch(async (req, res) => {
    const {
      status,
      fromDate,
      toDate,
      courseId,
      batchId,
      page = 1,
      limit = 10,
      sessionid,
    } = req.query;

    console.log(req.body, "********************** req.bodyy");
    const validStatuses = ["paid", "upcoming", "missed"];

    if (!status || !fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "status, fromDate, and toDate are required" });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'paid', 'upcoming', or 'missed'",
      });
    }

    const result = await Emiservices.getFilteredEmis({
      status,
      fromDate,
      toDate,
      courseId,
      batchId,
      sessionid,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.send(result);
  }),

  getFilteredEmisExcel: try_catch(async (req, res) => {
    const { status, fromDate, toDate, batchId, courseId } = req.query;

    if (!status || !fromDate || !toDate) {
      return res.status(400).json({
        message: "Status, fromDate, toDate, and batchId are required",
      });
    }

    try {
      const result = await Emiservices.getFilteredEmisExcel({
        status,
        fromDate,
        toDate,
        batchId,
        courseId,
      });
      console.log(result, "   res   ");
      // return
      if (result.rows.length < 1) {
        return res.status(404).json({ message: "No EMI data found" });
      }

      const emis = result.rows;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("EMI Report");

      worksheet.columns = [
        // { header: "ID", key: "id", width: 10 },
        { header: "Enrollment ID", key: "enrollment_id", width: 15 },
        { header: "Student Name", key: "student_name", width: 25 },
        { header: "Batch Name", key: "batch_name", width: 25 },
        { header: "Amount", key: "amount", width: 10 },
        { header: "due amount", key: "due_amount", width: 20 },
        // { header: "total_received", key: "total_received", width: 20 },
        { header: "Is Paid", key: "is_paid", width: 10 },
        { header: "Payment Date", key: "payment_date", width: 20 },
        { header: "EMI Due Date", key: "emi_duedate", width: 20 },
      ];
      emis.forEach((emi) => {
        worksheet.addRow({
          enrollment_id:
            emi.Student_Enrollment?.Student?.enrollment_id || "N/A",
          student_name: emi.Student_Enrollment?.Student?.name || "N/A",
          batch_name: emi.Student_Enrollment?.Batch?.BatchesName || "N/A",
          amount: emi.amount,
          due_amount: emi.due_amount,
          is_paid: emi.is_paid ? "Yes" : "No",
          payment_date: emi.payment_date || "N/A",
          emi_duedate: emi.emi_duedate,
        });
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=emi_report.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating EMI report:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }),

  getTodayEmiSummary: try_catch(async (req, res) => {
    const result = await Emiservices.getEmiSummaryByDate(); // No date passed
    res.status(200).json(result);
  }),

  updateEmiPayment: try_catch(async (req, res) => {
    const { emi_id, payment_date } = req.query;

    if (!emi_id || !payment_date) {
      return res
        .status(400)
        .json({ message: "emi_id and payment_date are required" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(payment_date)) {
      return res
        .status(400)
        .json({ message: "payment_date must be in YYYY-MM-DD format" });
    }
    const inputDate = moment(payment_date, "YYYY-MM-DD", true); // strict parsing
    const today = moment().startOf("day");

    if (!inputDate.isValid()) {
      return res.status(400).json({ message: "Invalid payment_date" });
    }

    if (inputDate.isAfter(today)) {
      return res
        .status(400)
        .json({ message: "payment_date cannot be in the future" });
    }
    const result = await Emiservices.updateEmiPayment(emi_id, payment_date);

    // if (!result.success) {
    //   return res.status(400).json({ message: result.message });
    // }

    return res
      .status(200)
      .json({ success: true, message: "emi paid successfully", emi: result });
  }),

  // getFilteredEmi : async (req, res) => {
  //   const { status, fromDate, toDate, batchId } = req.query;

  //   try {
  //     const emis = await Emiservices.getEmiSummary({
  //       status,
  //       fromDate,
  //       toDate,
  //       batchId,
  //     });

  //     return res.status(200).json({
  //       message: "EMI records fetched successfully",
  //       data: emis,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching filtered EMI records:", error);
  //     return res.status(500).json({
  //       message: "Error fetching EMI records",
  //       error: error.message,
  //     });
  //   }
  // }

  getFilteredEmi: async (req, res) => {
    const { status, fromDate, toDate, batchId, courseId, page, limit } =
      req.query;

    try {
      const emis = await Emiservices.getEmiSummary({
        status,
        fromDate,
        toDate,
        batchId,
        courseId,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        message: "EMI records fetched successfully",
        data: emis,
      });
    } catch (error) {
      console.error("Error fetching filtered EMI records:", error);
      return res.status(500).json({
        message: "Error fetching EMI records",
        error: error.message,
      });
    }
  },

  // Date validation
  // const from = new Date(fromDate);
  // const to = new Date(toDate);
  // if (isNaN(from) || isNaN(to)) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Invalid date format for fromDate or toDate"
  //   });
  // }

  // if (from > to) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "fromDate cannot be later than toDate"
  //   });
  // }

  // // Fetch data from service
  // const data = await Emiservices.getEmiSummary({ status, fromDate, toDate, batchId, courseId });
  // res.status(200).json({ success: true, data });

  emiDasboardApi: try_catch(async (req, res) => {
    const result = await Emiservices.emiDasboard();
    res
      .status(200)
      .json({
        success: true,
        message: "EMI total amounts retrieved successfully",
        data: result,
      });
  }),

  checkemiamount: try_catch(async (req, res) => {
    const { id, amount, payment_date } = req.body;
    // const studentData = await PaymentReceiptService.downloadReceiptForManay(id);

    // const {amount,payment_date} = studentData
    //  console.log("syuident data : ", studentData)

    const data = await PaymentReceiptService.emiAmountCheck(
      id,
      amount,
      payment_date
    );

    //   const { fileName } = await PaymentReceiptService.createReceiptmanay(
    //   studentData
    // );

    // console.log("Userr data  :  : :  : : ",data)

    //   const blob = await getBlob(`receipts/${fileName}`);
    // const stream = blob.readableStreamBody;
    // if (!stream) throw new customError("Failed to read blob stream", 500);

    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // // handle possible stream errors so the request doesn’t hang
    // stream.on("error", (err) => {
    //   console.error("Blob stream errored:", err);
    //   if (!res.headersSent) res.status(500).end();
    // });

    // stream.pipe(res);

    res.status(200).json({ success: true, message: "success", data: data });
  }),
  previewEmi: try_catch(async (req, res) => {
    const { student_id } = req.params;
    const { discount_percentage = 0, emi_frequency } = req.query;

    const result = await Emiservices.previewEmiPlan({
      student_id,
      discount_percentage: Number(discount_percentage),
      emi_frequency: Number(emi_frequency),
    });

    return res.status(200).json({
      success: true,
      message: "EMI preview generated successfully",
      data: result,
    });
  }),
  downloadeforresipet: try_catch(async (req, res) => {
    const { id, emi_id } = req.body;
    const studentData = await PaymentReceiptService.downloadReceiptForManay(id);
    console.log("syuident data : ", studentData);
    const { fileName } = await PaymentReceiptService.createReceiptmanay(
      studentData,
      emi_id
    );

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
    // res.status(200).json({status:true,data:studentData})
  }),
  getReciept: try_catch(async (req, res) => {
    let data = await PaymentReceiptService.getReciept(req.query.student_id);
    console.log(data);

    res.send({ success: true, data: data });
  }),
};
module.exports = emiController;

