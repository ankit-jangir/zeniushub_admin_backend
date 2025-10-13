'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class emp_batch extends Model {
    static associate(models) {
      // Association with Employee
      emp_batch.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee',
      });

      // Association with Batch
      emp_batch.belongsTo(models.Batches, {
        foreignKey: 'batch_id',
        
      });
    }
  }

  emp_batch.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      session_Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'emp_batch',
      tableName: 'emp_batches',
      timestamps: false,
    }
  );

  return emp_batch;
};
