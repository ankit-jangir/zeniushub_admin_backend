'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Course', 'date'); // Remove date column

    await queryInterface.changeColumn('Course', 'course_type', {
      type: Sequelize.STRING,
      defaultValue:'offline',
      allowNull: true,  // Making it nullable
    }); 
    await queryInterface.changeColumn('Course', 'discount_price', {
      type: Sequelize.FLOAT,
      defaultValue:0,
      allowNull: true,  // Making it nullable
    });
    await queryInterface.changeColumn('Course','banner',{
      type: Sequelize.STRING,
      allowNull:true
    })  
  },

  async down (queryInterface, Sequelize) {
   
  }
};
