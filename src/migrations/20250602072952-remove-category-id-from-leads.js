'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableDesc = await queryInterface.describeTable('Leads');
      if (tableDesc.category_id) {
        await queryInterface.removeColumn('Leads', 'category_id');
        console.log('✅ Removed column category_id from Leads');
      } else {
        console.log('⚠️ Skipping removeColumn: category_id does not exist in Leads');
      }
    } catch (error) {
      console.warn('⚠️ Error checking Leads table, skipping column removal:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableDesc = await queryInterface.describeTable('Leads');
      if (!tableDesc.category_id) {
        await queryInterface.addColumn('Leads', 'category_id', {
          type: Sequelize.INTEGER,
          allowNull: true, // or false if it was required before
        });
        console.log('✅ Added column category_id back to Leads');
      } else {
        console.log('⚠️ Skipping addColumn: category_id already exists in Leads');
      }
    } catch (error) {
      console.warn('⚠️ Error checking Leads table, skipping column addition:', error.message);
    }
  },
};
