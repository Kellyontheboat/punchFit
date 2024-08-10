'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ScheduleModules', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      schedule_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Schedules', // name of Target model
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      module_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'Modules', // name of Target model
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ScheduleModules');
  }
}
