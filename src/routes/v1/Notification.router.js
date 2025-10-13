const express = require("express")
const NotifactionController = require("../../controllers/Notifaction.Controller")
const authenticate = require("../../middleware/admin.auth")
const notifactionrouter = express.Router()

notifactionrouter.post("/addnotifactioncontroller", authenticate, NotifactionController.addnotifactioncontroller)
notifactionrouter.get("/getallnotificationcontroller", authenticate, NotifactionController.getallnotificationcontroller)
notifactionrouter.delete("/deleteallnotificationcontroller/:id", authenticate, NotifactionController.deleteallnotificationcontroller)

module.exports = notifactionrouter