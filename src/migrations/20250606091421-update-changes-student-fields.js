'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: constraint safe remove karo
    await queryInterface.sequelize.query(`
      ALTER TABLE "students"
      DROP CONSTRAINT IF EXISTS "students_contact_no_key1";
    `);

    // Step 2: column update karo — allowNull true aur unique false
    await queryInterface.changeColumn("students", "contact_no", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Column revert karo
    await queryInterface.changeColumn("students", "contact_no", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Constraint add karo
    await queryInterface.addConstraint("students", {
      fields: ["contact_no"],
      type: "unique",
      name: "students_contact_no_key",
    });
  },
};
