const express = require("express");
const { expensecontroler } = require("../../controllers/expense.controller");
const authenticate = require("../../middleware/admin.auth");

const expenserouter = express.Router();

expenserouter.post("/createExpanse",authenticate, expensecontroler.createExpense);


expenserouter.get("/all",authenticate, expensecontroler.getAllExpenses);


expenserouter.put("/update/:id", authenticate, expensecontroler.updateExpense);


expenserouter.delete("/delete/:id",authenticate, expensecontroler.deleteExpense);



expenserouter.get("/export/excel", expensecontroler.exportExpensesExcel);

module.exports = expenserouter;
