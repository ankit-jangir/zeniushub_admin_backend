'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Batches', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });
  },

  async down(queryInterface, Sequelize) {
    // First remove the column
    await queryInterface.removeColumn('Batches', 'status');

    // Then drop the ENUM type (important for PostgreSQL)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Batches_status";');
  },
};
