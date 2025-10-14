'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new column safely
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns 
          WHERE table_name='attendances' 
          AND column_name='student_enrollment_id'
        ) THEN
          ALTER TABLE attendances
          ADD COLUMN student_enrollment_id INTEGER REFERENCES "Student_Enrollments"(id)
          ON UPDATE CASCADE ON DELETE CASCADE NOT NULL;
        END IF;
      END
      $$;
    `);

    // Add unique constraint safely
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE table_name='attendances'
          AND constraint_name='unique_attendance_per_day_per_student'
        ) THEN
          ALTER TABLE attendances
          ADD CONSTRAINT unique_attendance_per_day_per_student UNIQUE (student_enrollment_id, attendance_date);
        END IF;
      END
      $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove unique constraint safely
    await queryInterface.sequelize.query(`
      ALTER TABLE attendances
      DROP CONSTRAINT IF EXISTS unique_attendance_per_day_per_student;
    `);

    // Remove column safely
    await queryInterface.sequelize.query(`
      ALTER TABLE attendances
      DROP COLUMN IF EXISTS student_enrollment_id;
    `);
  }
};
