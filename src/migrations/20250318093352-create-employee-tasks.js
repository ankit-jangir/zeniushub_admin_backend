'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EmployeeTasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_tittle: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^[A-Za-z\s]+$/i,
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      attachments: {
        type: Sequelize.STRING,
        allowNull: true
      },
      due_date: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
        }
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        }
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('ongoing', 'completed', 'not started', 'not completed'),
        allowNull: false,
        defaultValue: 'not started'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EmployeeTasks');
  }
};
