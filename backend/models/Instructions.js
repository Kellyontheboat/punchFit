const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Instructions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    instruction_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exercises_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Instructions',
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
        name: 'exercises_id',
        using: 'BTREE',
        fields: [
          { name: 'exercises_id' }
        ]
      }
    ]
  })
}
