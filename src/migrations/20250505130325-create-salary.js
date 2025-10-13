'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Salaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      emp_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      present: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      absent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      halfday: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      from_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      to_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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
    await queryInterface.dropTable('Salaries');
  },
};
