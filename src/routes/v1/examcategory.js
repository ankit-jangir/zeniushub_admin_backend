const express = require("express");
const authenticate = require("../../middleware/admin.auth");
const { examCategory } = require("../../controllers/examcategory");
const examCategoryRoute = express.Router();

examCategoryRoute.post("/add", authenticate, examCategory.addExamCategory);
examCategoryRoute.delete("/delete/:id", authenticate, examCategory.deleteExamCategory);

examCategoryRoute.get("/get", authenticate, examCategory.getAllExamCategory);


module.exports = { examCategoryRoute }



