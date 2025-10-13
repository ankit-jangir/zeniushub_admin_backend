"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StudentCertificate extends Model {
    static associate(models) {
      StudentCertificate.belongsTo(models.Student, {
        foreignKey: "student_id",
        onDelete: "CASCADE",
      });
    }
  }

  StudentCertificate.init(
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "students",
          key: "id",
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "StudentCertificate",
      tableName: "studentcertificates",
      underscored: true,
      timestamps: true,
    }
  );

  return StudentCertificate;
};
