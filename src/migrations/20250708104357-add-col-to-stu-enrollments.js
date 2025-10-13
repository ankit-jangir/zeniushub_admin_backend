'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Student_Enrollments', 'joining_date', {
      type: Sequelize.DATEONLY,
      defaultValue: Sequelize.literal('CURRENT_DATE'),
      allowNull: false,
    });

    await queryInterface.addColumn('Student_Enrollments', 'course_status', {
      type: Sequelize.ENUM('ongoing', 'dropped', 'promoted', 'repeat'),
      defaultValue: 'ongoing',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Student_Enrollments', 'joining_date');
    await queryInterface.removeColumn('Student_Enrollments', 'course_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Student_Enrollments_course_status";');
  }
};
