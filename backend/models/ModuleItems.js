const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const ModuleItems = sequelize.define('ModuleItems', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    exercise_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Exercises',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    module_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Modules',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 12
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 4
    },
    weight: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 5.00
    }
  }, {
    sequelize,
    tableName: 'ModuleItems',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [
          { name: 'id' }
        ]
      }
    ]
  });

  // Define associations
  ModuleItems.associate = function (models) {
    ModuleItems.belongsTo(models.Exercises, { foreignKey: 'exercise_id', as: 'exercise' });
    ModuleItems.belongsTo(models.Modules, { foreignKey: 'module_id', as: 'module' });
  };

  return ModuleItems;
};
