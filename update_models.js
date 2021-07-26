var SequelizeAuto = require('sequelize-auto')
// const newDatabase = require("./config/databaseConfig.json").newDatabase

var database = require( './databaseconfig')

authenticationObject = database
var auto = new SequelizeAuto(
    authenticationObject.database,
    authenticationObject.username,
    authenticationObject.password,
    {
        host: authenticationObject.host,
        port: '3306',
        dialect: authenticationObject.dialect,
        additional: {
            timestamps: false
        }
    }
)

auto.run(function (err) {
    if (err) throw err

    //   console.log(auto.tables);
    //   console.log(auto.foreignKeys);
})
