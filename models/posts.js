const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('posts', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    submission_id: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "submission_id"
    }
  }, {
    sequelize,
    tableName: 'posts',
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
        name: "submission_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "submission_id" },
        ]
      },
    ]
  });
};
