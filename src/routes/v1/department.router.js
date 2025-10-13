const express = require("express");
const { departmentController } = require("../../controllers/department.controller");
const authenticate = require("../../middleware/admin.auth");
const departmentrouter = express.Router();

departmentrouter.post("/adddepartment", authenticate, departmentController.adddepartment)
departmentrouter.get("/getDepartment", authenticate, departmentController.getdepartment)
departmentrouter.put("/updateDepartment", authenticate, departmentController.updatedepartment)
departmentrouter.delete("/deleteDepartment", authenticate, departmentController.delete)
departmentrouter.get("/getOnedepartment", authenticate, departmentController.getOnedepartment)
departmentrouter.post("/accessdepartment", authenticate, departmentController.accessdepartment)
departmentrouter.get("/getAccessDepartment", authenticate, departmentController.getAccessDepartment)
departmentrouter.get("/access-control", authenticate, departmentController.getAccessControl)
departmentrouter.get("/access/control", authenticate, departmentController.getAllAccessControl)
departmentrouter.put("/updateAccessDepartment", authenticate, departmentController.updateAccessDepartment)
departmentrouter.post("/filterdata", authenticate, departmentController.filterdata)

module.exports = { departmentrouter }

