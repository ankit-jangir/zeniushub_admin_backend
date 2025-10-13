'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change existing 'amount' column to FLOAT
    await queryInterface.changeColumn('Emis', 'amount', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    // Add new 'due_amount' column as FLOAT
    await queryInterface.addColumn('Emis', 'due_amount', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert 'amount' back to INTEGER
    await queryInterface.changeColumn('Emis', 'amount', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Remove the 'due_amount' column
    await queryInterface.removeColumn('Emis', 'due_amount');
  }
};
