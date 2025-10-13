const { mainexpense } = require("../services/expense.services");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const expenseSchema = require("../validators/expense.validation");

const expensecontroler = {
  createExpense : try_catch(async (req, res) => {
  const result = expenseSchema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.errors.map(err => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return res.status(400).json({ success: false, errors: formattedErrors });
  }

  const data = await mainexpense.createExpense(result.data);

  res.status(201).json({ success: true, data });
}),

  getAllExpenses: try_catch(async (req, res) => {
  const data = await mainexpense.getAllExpenses(req.query); // filters + pagination from query
  res.status(200).json({ success: true, ...data });
}),

  updateExpense: try_catch(async (req, res) => {
    const id = req.params.id;
  
    const data = await mainexpense.updateExpense(id, req.body);
    res.status(200).json({ success: true, data });
  }),

  deleteExpense: try_catch(async (req, res) => {
    const id = req.params.id;
    const data = await mainexpense.deleteExpense(id);
    res.status(200).json({ success: true, data });
  }),


   exportExpensesExcel: try_catch(async (req, res) => {
    const workbook = await mainexpense.exportExpensesToExcel(req.query);

    // Response headers for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=expenses_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  }),
};

module.exports = { expensecontroler };
