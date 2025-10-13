'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PopularCourses extends Model {
    static associate(models) {
      // define association here
    }
  }
  PopularCourses.init({
    title: DataTypes.STRING,         // added title field
    description: DataTypes.TEXT,     // added description field
    image: DataTypes.STRING         // added image field
  }, {
    sequelize,
    tableName: "PopularCourses",
    modelName: 'PopularCourses',
    timestamps: true, // Ensures createdAt and updatedAt are automatically managed
    underscored: true, // Converts createdAt -> created_at, updatedAt -> updated_at
  });
  return PopularCourses;
};
