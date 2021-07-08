const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usr_user', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: "Store as string to save space"
    },
    current_username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Must be updated accordingly",
      unique: "current_username"
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'usr_user',
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
        name: "current_username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "current_username" },
        ]
      },
    ]
  });
};
