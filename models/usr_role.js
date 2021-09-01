const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
        'usr_role',
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'usr_user',
                    key: 'id',
                },
                primaryKey: true,
            },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'cfg_role',
                    key: 'id',
                },
                primaryKey: true,
            },
        },
        {
            sequelize,
            tableName: 'usr_role',
            timestamps: false,
        }
    );
};
