'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('Schedules', 'date', 'schedule_date');
    await queryInterface.removeColumn('Schedules', 'exercise_id');
  },

  async down (queryInterface, Sequelize) {
    queryInterface.renameColumn('Schedules', 'schedule_date', 'date');
    await queryInterface.addColumn('Schedules', 'exercise_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
