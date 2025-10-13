'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExamCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here (e.g. ExamCategory.hasMany(models.Exam))
    }
  }

  ExamCategory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,

    },


  }, {
    sequelize,
    modelName: 'ExamCategory',
    tableName: 'ExamCategories',
    timestamps: true,


  });

  return ExamCategory;
};
