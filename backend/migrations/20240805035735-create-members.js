'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Members', {
      id: {
        autoIncrement: true,
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Members')
  }
}
