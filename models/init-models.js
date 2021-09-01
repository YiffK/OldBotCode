var DataTypes = require("sequelize").DataTypes;
var _cfg_role = require("./cfg_role");
var _posts = require("./posts");
var _queue = require("./queue");
var _sources = require("./sources");
var _usage_log = require("./usage_log");
var _usr_role = require("./usr_role");
var _usr_user = require("./usr_user");

function initModels(sequelize) {
  var cfg_role = _cfg_role(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var queue = _queue(sequelize, DataTypes);
  var sources = _sources(sequelize, DataTypes);
  var usage_log = _usage_log(sequelize, DataTypes);
  var usr_role = _usr_role(sequelize, DataTypes);
  var usr_user = _usr_user(sequelize, DataTypes);

  usr_role.belongsTo(cfg_role, { as: "role", foreignKey: "role_id"});
  cfg_role.hasMany(usr_role, { as: "usr_roles", foreignKey: "role_id"});
  usage_log.belongsTo(usr_user, { as: "user_internal", foreignKey: "user_internal_id"});
  usr_user.hasMany(usage_log, { as: "usage_logs", foreignKey: "user_internal_id"});
  usr_role.belongsTo(usr_user, { as: "user", foreignKey: "user_id"});
  usr_user.hasMany(usr_role, { as: "usr_roles", foreignKey: "user_id"});

  return {
    cfg_role,
    posts,
    queue,
    sources,
    usage_log,
    usr_role,
    usr_user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
