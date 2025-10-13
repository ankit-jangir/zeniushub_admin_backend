const { Op } = require("sequelize");
const {Expense,CategoryName} = require("../models");
const { CrudRepository } = require("./crud.repo");

class expenseRepositories extends CrudRepository {
    constructor() {
        super(Expense);
    }
    async getexceldata(filters = {}) {
    const { name, paymentMethod, startDate, endDate } = filters;

    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    if (startDate && endDate)
      whereClause.date = { [Op.between]: [startDate, endDate] };
    else if (startDate) whereClause.date = { [Op.gte]: startDate };
    else if (endDate) whereClause.date = { [Op.lte]: endDate };

    // Expenses fetch with category include
    const expenses = await this.model.findAll({
      where: whereClause,
      include: [
        {
          model: CategoryName,
          as: 'categoryData', // alias in Expense.belongsTo(CategoryName, { as:'categoryData' })
          attributes: ['id', 'categoryName'],
        },
      ],
      raw: true,   // flat object
      nest: false, // nested keys disabled
    });

    return expenses;
  }
}

module.exports={expenseRepositories}