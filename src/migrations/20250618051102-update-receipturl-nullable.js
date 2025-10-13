'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('PaymentReceipts', 'receipt_url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('PaymentReceipts', 'receipt_url', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
