'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new column
  await queryInterface.addColumn('attendances', 'student_enrollment_id', {
  type: Sequelize.INTEGER, // or STRING based on your Student_Enrollments primary key type
  allowNull: false,
  references: {
    model: 'Student_Enrollments',
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

    // Add unique constraint for (student_enrollment_id + attendance_date)
    await queryInterface.addConstraint('attendances', {
      fields: ['student_enrollment_id', 'attendance_date'],
      type: 'unique',
      name: 'unique_attendance_per_day_per_student'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint
    await queryInterface.removeConstraint('attendances', 'unique_attendance_per_day_per_student');

    // Remove column
    await queryInterface.removeColumn('attendances', 'student_enrollment_id');
  }
};
