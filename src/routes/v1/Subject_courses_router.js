const express = require("express")
const subcoursesController = require("../../controllers/Subject.Courses.Controller");
const authenticate = require("../../middleware/admin.auth");
const subjectcoursesrouter = express.Router()

subjectcoursesrouter.post("/addsubcourses", authenticate, subcoursesController.addsubcourses);
subjectcoursesrouter.get("/getallsubcoursecontroller", authenticate, subcoursesController.getallsubcoursecontroller);
subjectcoursesrouter.get("/course", authenticate, subcoursesController.getCourse);
subjectcoursesrouter.delete("/deletesubcoursescontroller", authenticate, subcoursesController.deletesubcoursescontroller);
// subjectcoursesrouter.put("/updatesubcoursescontroller", subcoursesController.updatesubcoursescontroller);


module.exports = subjectcoursesrouter