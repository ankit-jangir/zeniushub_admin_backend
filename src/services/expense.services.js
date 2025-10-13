const { Op } = require("sequelize");
const { expenseRepositories } = require("../repositories/expense.repo");
const ExcelJS = require("exceljs");
const { CategoryName } = require("../models");
const expenseRepo = new expenseRepositories();
const categorynameRepository = require("../repositories/categoryexpense.repo");
const customError = require("../utils/error.handler");

const mainexpense = {
  // Create Expense
  createExpense: async (data) => {
    const categoryidcheck = await categorynameRepository.findOne({id:data.categoryId}) 
  if (!categoryidcheck) {
  throw new customError(`Category not found for this id ${data.categoryId}`);
}

    return await expenseRepo.create(data);
  },

  // Get All Expenses with optional filters
  getAllExpenses: async (filters) => {
    const {
      name,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = filters;

    const whereClause = {};

    if (name) {
      whereClause.name = { [Op.iLike]: `%${name}%` }; // case-insensitive partial match
    }

    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }

    if (startDate && endDate) {
      whereClause.date = { [Op.gte]: startDate, [Op.lte]: endDate };
    } else if (startDate) {
      whereClause.date = { [Op.gte]: startDate };
    } else if (endDate) {
      whereClause.date = { [Op.lte]: endDate };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await expenseRepo.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: CategoryName,
          as: "categoryData",
          attributes: ["categoryName"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["date", "DESC"]], // latest expenses first
      raw: true, // 👈 raw: true use karne se flat object banega
      nest: false,
    });

    console.log(result.rows, "555%%%%%%%%%%%%% ");
    return {
      total: result.count,
      pages: Math.ceil(result.count / limit),
      currentPage: parseInt(page),
      data: result.rows,
    };
  },

  // Update Expense by ID
  updateExpense: async (id, data) => {
    const userdataid = await expenseRepo.getDataById(id)
  if (!userdataid) {
  throw new customError("Data Not Found");
}

    const [updatedCount] = await expenseRepo.update(data, { id });
    if (!updatedCount) throw { status: 404, message: "Expense not found" };
    return await expenseRepo.getDataById(id);
  },

  // Delete Expense by ID
  deleteExpense: async (id) => {

    const deleted = await expenseRepo.deleteData(id);
    if (!deleted) throw { status: 404, message: "Expense not found" };
    return { message: "Expense deleted successfully" };
  },
  exportExpensesToExcel : async (filters) => {
  // fetch data from repo
  const expenses = await expenseRepo.getexceldata(filters);

  if (!expenses || expenses.length === 0) {
    throw { status: 404, message: 'Expense not found' };
  }

  // Excel workbook create
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Category Name', key: 'categoryName', width: 20 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 15 },
    { header: 'Referral Name', key: 'referralName', width: 20 },
    { header: 'Description', key: 'description', width: 30 },
  ];

  expenses.forEach((expense) => {
    worksheet.addRow({
      id: expense.id,
      name: expense.name,
      categoryName: expense['categoryData.categoryName'] || '', // raw:true
      date: expense.date,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      referralName: expense.referralName,
      description: expense.description,
    });
  });

  return workbook;
},
};

module.exports = { mainexpense };
