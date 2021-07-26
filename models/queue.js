const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('queue', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    imgURL: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    obj: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'queue',
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
        name: "imgURL",
        unique: true,
        using: "HASH",
        fields: [
          { name: "imgURL" },
          { name: "obj" },
        ]
      },
    ]
  });
};
