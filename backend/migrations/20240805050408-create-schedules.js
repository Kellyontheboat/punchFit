'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Schedules', {
      id: {
        autoIncrement: true,
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Members',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Schedules')
  }
}
