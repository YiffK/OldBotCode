const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usage_log', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_internal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usr_user',
        key: 'id'
      }
    },
    command: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'usage_log',
    timestamps: false
  });
};
