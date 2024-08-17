const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const Exercise = sequelize.define('Exercises', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    force: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    mechanic: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    equipment: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    parts_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Parts',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Exercises',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'fk_parts',
        using: 'BTREE',
        fields: [
          { name: 'parts_id' }
        ]
      }
    ]
  })
  Exercise.associate = function (models) {
    Exercise.belongsTo(models.Parts, { foreignKey: 'parts_id', as: 'part' })

    Exercise.hasMany(models.Images, { foreignKey: 'exercises_id' })

    Exercise.hasMany(models.ScheduleItems, { foreignKey: 'exercise_id', as: 'scheduleItems' })
  }

  return Exercise
}
