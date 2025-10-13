'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeAttendences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees', // Ensure this matches the Employees table name
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM('present', 'half_day'),
        allowNull: false,
      },
      attendence_date: {
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
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmployeeAttendences');
  },
};
