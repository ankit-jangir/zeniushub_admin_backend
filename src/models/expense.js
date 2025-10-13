'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // Expense belongs to CategoryName
      Expense.belongsTo(models.CategoryName, {
        foreignKey: 'categoryId',
        as: 'categoryData',
        
      });
    }
  }

  Expense.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // foreign key for CategoryName
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categorynames', // table name from migration
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.ENUM('upi', 'cash', 'card', 'online'),
        allowNull: false
      },
      referralName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Expense',
      tableName: 'Expenses',
      timestamps: true
    }
  );

  return Expense;
};
