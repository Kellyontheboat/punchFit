'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Schedules', 'schedule_name', {
      type: Sequelize.STRING,
      allowNull: true, // You can change this to false if you want to make it required
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Schedules', 'schedule_name');
  }
}

