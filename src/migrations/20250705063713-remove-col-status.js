'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove 'status' from 'Students'
    // await queryInterface.removeColumn('students', 'status');

    // 2. Add 'status' to 'Student_Enrollment' as BOOLEAN with default true
    await queryInterface.addColumn('Student_Enrollments', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed
  }
};
