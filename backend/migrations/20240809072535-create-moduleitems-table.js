'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ModuleItems', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Exercises', // name of Target model
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      },
      reps: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 12
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 4
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 5.00
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ModuleItems');
  }
}

