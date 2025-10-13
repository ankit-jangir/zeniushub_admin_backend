'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Emi extends Model {
    static associate(models) {
      // define association here if needed
      // Emi.belongsTo(models.Student, { foreignKey: 'student_id' });
      // Emi.belongsTo(models.Student_Enrollment, {
      //   foreignKey: "student_id",
      //   onUpdate: "CASCADE",
      //   onDelete: "CASCADE",
      // });
      Emi.belongsTo(models.Student_Enrollment, {
        foreignKey: "enrollment_id",
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });


    }
  }

  Emi.init({
    txn_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enrollment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Student_Enrollments',
        key: 'id',
      },
    },

    is_paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emi_duedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    due_amount: {
      type: DataTypes.FLOAT,
      allowNullL: false
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Emi',
    tableName: 'Emis',
    timestamps: true,
    underscored: true
  }); 6 

  return Emi;
};
