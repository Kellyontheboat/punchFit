const Sequelize = require('sequelize')
module.exports = function (sequelize, DataTypes) {
  const Messages = sequelize.define('Messages', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'roomNumber'
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message_text'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    read: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    }
  }, {
    sequelize,
    tableName: 'Messages',
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

  Messages.associate = (models) => {
    Messages.belongsTo(models.Members, { as: 'member', foreignKey: 'sender_id' })
  }
  return Messages

}