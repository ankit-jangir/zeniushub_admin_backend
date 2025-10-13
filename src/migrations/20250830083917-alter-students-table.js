'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("students", "parent_contact_number", {
      type: Sequelize.STRING,
      allowNull: true, 
      unique: false,
    });

    // Modify contact_no to allow null and remove unique constraint
    await queryInterface.changeColumn("students", "contact_no", {
      type: Sequelize.STRING,
      allowNull: true, // Change to allow null
      unique: false, // Remove unique constraint
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
