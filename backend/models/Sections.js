module.exports = function (sequelize, DataTypes) {
  const Section = sequelize.define('Sections', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    section_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Sections',
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
  })

  // Define associations
  Section.associate = function (models) {
    Section.hasMany(models.Parts, { foreignKey: 'sections_id', as: 'parts' })
  }

  return Section
}
