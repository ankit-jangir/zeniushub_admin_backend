'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("Batches", "BatchFees", {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    
  }
};
