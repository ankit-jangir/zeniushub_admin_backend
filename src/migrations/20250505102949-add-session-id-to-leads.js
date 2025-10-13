'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Leads', 'session_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Sessions', // Replace with actual session table name if different
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Leads', 'session_id');
  },
};
