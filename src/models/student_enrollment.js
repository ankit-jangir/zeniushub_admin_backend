'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student_Enrollment extends Model {
    static associate(models) {
      // Associations
      Student_Enrollment.belongsTo(models.Student, {
        foreignKey: 'student_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Course, {
        foreignKey: 'course_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Batches, {
        foreignKey: 'batch_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Session, {
        foreignKey: 'session_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      // Student_Enrollment.hasMany(models.Emi, {
      //   foreignKey: 'student_id',
      //   onDelete: 'CASCADE',
      // });
      Student_Enrollment.hasMany(models.Emi, {
        foreignKey: 'enrollment_id',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.hasMany(models.Attendance, {
    foreignKey: 'student_enrollment_id',
    as: 'Attendances',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });


    }
  }

  Student_Enrollment.init({
    // firstName: DataTypes.STRING,
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    number_of_emi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    course_status: {
      type: DataTypes.ENUM('ongoing', 'dropped', 'promoted', 'repeat'),
      allowNull: false,
      defaultValue: 'ongoing'
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_DATE')
    },
    ending_course_date:{
      type:DataTypes.DATEONLY,
      allowNull:false,
    }

  }, {
    sequelize,
    modelName: 'Student_Enrollment',
    tableName: 'Student_Enrollments',
  });

  return Student_Enrollment;
};
