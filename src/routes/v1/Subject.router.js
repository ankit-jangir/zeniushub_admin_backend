const express = require("express");
const { subjectcontroller } = require("../../controllers/Subjectcontroller");
const authenticate = require("../../middleware/admin.auth");
const subjectrouter = express.Router();

subjectrouter.post("/addsubject", authenticate, subjectcontroller.addsubject);
subjectrouter.put(
  "/updatebysubjectnamecontroller", authenticate,
  subjectcontroller.updatebysubjectnamecontroller
);
subjectrouter.delete(
  "/deletesubjectcontroller", authenticate,
  subjectcontroller.deletesubjectcontroller
);
subjectrouter.get(
  "/getallsubjectcontroller", authenticate,
  subjectcontroller.getallsubjectcontroller
);
subjectrouter.post(
  "/searchbysubjectnamecontroller", authenticate,
  subjectcontroller.searchbysubjectnamecontroller
);

module.exports = { subjectrouter };
