const express = require("express");
const categoryController = require("../../controllers/Category.controller");
const authenticate = require("../../middleware/admin.auth");
const categoryrouter = express.Router()

categoryrouter.post("/addcategorycontroller", authenticate, categoryController.addcategorycontroller)
categoryrouter.get("/getallcategorycontroller", authenticate, categoryController.getallcategorycontroller)
categoryrouter.delete("/deletecategorycontroller", authenticate, categoryController.deletecategorycontroller)
categoryrouter.put("/updatecategorycontroller/:id", authenticate, categoryController.updatecategorycontroller)

module.exports = categoryrouter