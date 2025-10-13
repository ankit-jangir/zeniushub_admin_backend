'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Leads', 'category_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Leads', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if it was required before
    });
  },
};
