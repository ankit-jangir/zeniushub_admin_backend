"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Simply change allowNull, no need to remove constraint
    await queryInterface.changeColumn("students", "email", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn("students", "pancard_no", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("students", "profile_image", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("students", "email", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn("students", "pancard_no", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};
