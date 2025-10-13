'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CategoryName extends Model {
    static associate(models) {
      // One CategoryName has many Expenses
      CategoryName.hasMany(models.Expense, {
        foreignKey: 'categoryId',
        as: 'expenses'
      });
    }
  }

  CategoryName.init(
    {
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'CategoryName',
      tableName: 'categorynames'
    }
  );

  return CategoryName;
};
