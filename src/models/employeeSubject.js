'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class employeeSubject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      employeeSubject.belongsTo(models.Employee,{
        foreignKey:'employeeId',
        onDelete:'CASCADE'
      })

      //An employeeSubject belongs to one Subject
      employeeSubject.belongsTo(models.Subject,{
        foreignKey:'subjectId',
        onDelete:'CASCADE'
      })
      employeeSubject.belongsTo(models.Course,{
        foreignKey:'course_id',
        onDelete:'CASCADE'
      })
    }
  }
  employeeSubject.init({
    subjectId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Subjects',
        key:'id',
      }
    },
      course_id:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Course',
        key:'id',
      }
    },
    employeeId: {
     type:DataTypes.INTEGER,
     allowNull:false,
     references:{
      model:'Employees',
      key:'id'
     }
    }
  }, {
    sequelize,
    modelName: 'employeeSubject',
    tableName: 'employeeSubject',
    timestamps: true, // Ensures createdAt and updatedAt are automatically managed
    // underscored: true,
  });
  return employeeSubject;
};