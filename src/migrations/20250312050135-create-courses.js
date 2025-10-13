'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      course_name: {
        type: Sequelize.STRING
      },
      course_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      course_duration: {
        type: Sequelize.INTEGER, // assuming duration is in number format (like days, months)
        allowNull: false
      },
      banner: {
        type: Sequelize.STRING // assuming this is a URL or file path
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      course_price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      discount_price: {
        type: Sequelize.FLOAT
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
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
    await queryInterface.dropTable('Courses');
  }
};
