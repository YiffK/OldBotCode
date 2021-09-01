var SequelizeAuto = require('sequelize-auto');
// const newDatabase = require("./config/databaseConfig.json").newDatabase
const { Sequelize } = require('sequelize');
var database = require('./databaseconfig');

authenticationObject = database;

var config = new Sequelize(database);
const auto = new SequelizeAuto(config, null, null, {});

auto.run(function (err) {
    if (err) throw err;

    //   console.log(auto.tables);
    //   console.log(auto.foreignKeys);
});
