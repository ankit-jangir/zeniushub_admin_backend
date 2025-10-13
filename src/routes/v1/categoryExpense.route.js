const express = require("express");
const categorycontroller = require("../../controllers/categoryexpense"); 
// yeh wahi controller hai jisme maine addCategory, getCategories, getCategory, updateCategory, deleteCategory banaye hain

const categoryexp = express.Router();

// ✅ Create new category
categoryexp.post("/create", categorycontroller.addCategory);

// ✅ Get all categories
categoryexp.get("/", categorycontroller.getCategories);

// ✅ Get single category by id
categoryexp.get("/:id", categorycontroller.getCategory);

// ✅ Update category by id
categoryexp.put("/update/:id", categorycontroller.updateCategory);

// ✅ Delete category by id
categoryexp.delete("/delete/:id", categorycontroller.deleteCategory);

module.exports = categoryexp;
