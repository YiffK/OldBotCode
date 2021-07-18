const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usage_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_internal_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      comment: "Not the user id from telegram, but the internal one.",
      references: {
        model: 'usr_user',
        key: 'id'
      }
    },
    command: {
      type: DataTypes.STRING(40),
      allowNull: false,
      comment: "The command used"
    },
    arguments: {
      type: DataTypes.STRING(191),
      allowNull: true,
      comment: "The arguments in the command"
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    issued_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'usage_log',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "user_internal_id",
        using: "BTREE",
        fields: [
          { name: "user_internal_id" },
        ]
      },
    ]
  });
};
