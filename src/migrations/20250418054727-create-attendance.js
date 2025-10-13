'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      enrollment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'students',
          key: 'enrollment_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'half day'),
        allowNull: false,
      },
      attendance_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      in_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      out_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add unique constraint for (enrollment_id + attendance_date)
    await queryInterface.addConstraint('attendances', {
      fields: ['enrollment_id', 'attendance_date'],
      type: 'unique',
      name: 'unique_attendance_per_day_per_student'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop ENUM before dropping the table to avoid type errors in PostgreSQL
    await queryInterface.dropTable('attendances');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_attendances_status";');
  }
};