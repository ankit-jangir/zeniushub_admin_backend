const express = require("express");
const coursescontroller = require("../../controllers/Courses.controller");
const authenticate = require("../../middleware/admin.auth");
const coursesrouter = express.Router();

coursesrouter.post("/addcourse", authenticate, coursescontroller.addcours);
coursesrouter.put("/updatecoursescontroller", authenticate, coursescontroller.updatecoursesController);
coursesrouter.delete("/deletecoursecontroller/:id", authenticate, coursescontroller.deletecoursecontroller);
coursesrouter.put("/mark-active", authenticate, coursescontroller.markAsActive);
coursesrouter.get("/getallcoursescontroller", authenticate, coursescontroller.getallcoursescontroller);
coursesrouter.get("/Searchbycoursesnamecontroller", authenticate, coursescontroller.Searchbycoursesnamecontroller);
// coursesrouter.post("/paginactionbycontroller",coursescontroller.paginactionbycontroller)
coursesrouter.post("/coursenotmatchcontroller", authenticate, coursescontroller.coursenotmatchcontroller)
coursesrouter.get("/coursecounter/:id", authenticate, coursescontroller.coursecountercontroller)
coursesrouter.get("/coursefilter", authenticate, coursescontroller.coursefilter)


module.exports = coursesrouter; 
