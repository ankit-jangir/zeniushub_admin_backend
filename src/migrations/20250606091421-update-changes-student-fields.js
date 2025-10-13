"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "students",
      "students_contact_no_key1"
    );

    // Step 2: फिर column को update करो — allowNull true और unique false
    await queryInterface.changeColumn("students", "contact_no", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("students", "contact_no", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addConstraint("students", {
      fields: ["contact_no"],
      type: "unique",
      name: "students_contact_no_key",
    });
  },
};
