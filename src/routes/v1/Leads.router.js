const express = require("express");
const leadscontroller = require("../../controllers/Leads.controller");
const authenticate = require("../../middleware/admin.auth");
const leadsrouter = express.Router();

leadsrouter.post("/addleadscontroller", authenticate, leadscontroller.addleadscontroller)
leadsrouter.get("/getallLeadscontroller", authenticate, leadscontroller.getallLeadscontroller)
leadsrouter.delete("/deleteLeadscontroller/:id", authenticate, leadscontroller.deleteLeadscontroller)
leadsrouter.post("/filterleadsstatuscontroller/:status", authenticate, leadscontroller.filterleadsstatuscontroller)
leadsrouter.post("/FilterCategoryController/:category_id", authenticate, leadscontroller.FilterCategoryController)
leadsrouter.get("/searchingleadsController", authenticate, leadscontroller.searchingleadsController)
leadsrouter.post("/changestatusLeadsController", authenticate, leadscontroller.changestatusLeadsController)
leadsrouter.post("/changeAssineTaskLeadscontroller", authenticate, leadscontroller.changeAssineTaskLeadscontroller)
leadsrouter.post("/filterAndSearchLeadsController", authenticate, leadscontroller.filterAndSearchLeadsController)
leadsrouter.get('/lead-summary', authenticate, leadscontroller.getLeadsStatusSummary);
leadsrouter.post("/converttostudent", authenticate, leadscontroller.converttostudent)


module.exports = leadsrouter