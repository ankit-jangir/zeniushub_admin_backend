'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Batches', 'Session_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Batches', 'Session_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Sessions', // check your actual table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
