const categoryexpense = require("../services/categoryexpense.services");
const { try_catch } = require("../utils/tryCatch.handler");

const categorycontroller = {
  // Create
  addCategory: try_catch(async (req, res) => {
    const data = await categoryexpense.createcategory(req.body);
    res.status(201).json({ success: true, data });
  }),

  // Get All
  getCategories: try_catch(async (req, res) => {
    const data = await categoryexpense.getAllCategories();
    res.status(200).json({ success: true, data });
  }),

  // Get Single
  getCategory: try_catch(async (req, res) => {
    const data = await categoryexpense.getCategoryById(req.params.id);
    res.status(200).json({ success: true, data });
  }),

  // Update
  updateCategory: try_catch(async (req, res) => {
    const data = await categoryexpense.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  }),

  // Delete
  deleteCategory: try_catch(async (req, res) => {
    const data = await categoryexpense.deleteCategory(req.params.id);
    res.status(200).json({ success: true, data });
  }),
};

module.exports = categorycontroller;
