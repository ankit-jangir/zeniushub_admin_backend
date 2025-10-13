'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PaymentReceipts', 'payment_date', {
      type: Sequelize.DATEONLY,
      allowNull: true, // Ya false if required
      defaultValue: Sequelize.NOW // Default to current date
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PaymentReceipts', 'payment_date');
  }
};
