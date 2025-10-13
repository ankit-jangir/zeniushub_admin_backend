"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Notifications", "course_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Courses", // Courses table ka naam
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Notifications", "course_id");
  },
};
