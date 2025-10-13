'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add session_Id to emp_batches
    await queryInterface.addColumn(
      'emp_batches',
      'session_Id',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'id',
        },
        defaultValue: null
      }
    );

    // Add session_Id to emp_subjs
    await queryInterface.addColumn(
      'emp_subjs',
      'session_Id',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Sessions',
          key: 'id',
        },
        defaultValue: null
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove session_Id from both tables during rollback
    await queryInterface.removeColumn('emp_batches', 'session_Id');
    await queryInterface.removeColumn('emp_subjs', 'session_Id');
  }
};
