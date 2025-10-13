"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Subjects", "status", {
      type: Sequelize.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Subjects", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Subjects_status";'
    );
  },
};
