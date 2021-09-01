const { initModels } = require('./init-models');
const { Sequelize } = require('sequelize');
const database = require('../databaseconfig');
var sequelize = new Sequelize(database);

initModels(sequelize);

module.exports.sequelize = sequelize;
