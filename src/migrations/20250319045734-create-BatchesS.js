'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Batches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',  
          key: 'id'
        }},
      BatchesName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      StartDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      EndDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      StartTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      EndTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
      GracePeriod: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      Session_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      BatchFees: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Batches');
  }
};
