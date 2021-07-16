const { initModels } = require('./init-models')
const { Sequelize } = require('sequelize')
const {
    database,
    dialect, host, logging, password, username, port
} = require('../databaseconfig')
var sequelize = new Sequelize(
    database,
    username,
    password,
    {
        username,
        password,
        database,
        host,
        port,
        dialect,
        logging,
    },
)

initModels(sequelize)

module.exports.sequelize = sequelize
