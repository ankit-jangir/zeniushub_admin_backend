'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove StartDate and EndDate columns from Batches table
    await queryInterface.removeColumn('Batches', 'StartDate');
    await queryInterface.removeColumn('Batches', 'EndDate');
  },

  async down(queryInterface, Sequelize) {
    // In case you want to undo the migration
  }
};
