module.exports = function (sequelize, DataTypes) {
  const Part = sequelize.define('Parts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    part_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    sections_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Parts',
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
        name: 'sections_id',
        using: 'BTREE',
        fields: [
          { name: 'sections_id' }
        ]
      }
    ]
  })

  Part.associate = function (models) {
    Part.belongsTo(models.Sections, { foreignKey: 'sections_id', as: 'section' })
    Part.hasMany(models.Exercises, { foreignKey: 'parts_id', as: 'exercises' })
  }

  return Part
}
