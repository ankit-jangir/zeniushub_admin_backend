const express = require("express");
// const { addEmi } = require("../../controllers/emis.controller");
const emiController = require("../../controllers/emis.controller");
const { addOneShotEmi } = require("../../services/emis.services");
const authenticate = require("../../middleware/admin.auth");
const emiRoute = express.Router();

emiRoute.post("/addEmi", authenticate, emiController.addEmi);
emiRoute.post("/addOneShotEmi", authenticate, emiController.addOneShotEmi);
emiRoute.get("/getEmis", authenticate, emiController.getEmis);
emiRoute.put("/changeStatus/:id", authenticate, emiController.markEmiPaid);
emiRoute.get("/getEmisTotalAmounts", authenticate, emiController.getEmisTotalAmounts);
emiRoute.get("/getOneStudentPayment", authenticate, emiController.getOneStudentPayment);
emiRoute.get("/emiDasboard", authenticate, emiController.emiDasboardApi);
// emiRoute.get('/download-receipt/:enrollment_id', emiController.downloadReceipt);
// emiRoute.get("/getOneStudentPayment", emiController.getOneStudentPayment);
emiRoute.get("/emis", authenticate, emiController.getFilteredEmis);
emiRoute.get('/emis/download/excel', authenticate, emiController.getFilteredEmisExcel);
emiRoute.get("/emis/today-summary", authenticate, emiController.getTodayEmiSummary);
emiRoute.get("/emis/update-payment", authenticate, emiController.updateEmiPayment);
emiRoute.get("/emis/alldata", authenticate, emiController.getFilteredEmi);
emiRoute.post("/checkemiamount", authenticate, emiController.checkemiamount);
emiRoute.get("/showemi/:student_id", authenticate, emiController.previewEmi)
emiRoute.get("/downloadeforresipet", authenticate, emiController.downloadeforresipet);
emiRoute.get("/reciept", authenticate, emiController.getReciept);





module.exports = { emiRoute };


