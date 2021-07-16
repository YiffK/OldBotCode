var DataTypes = require("sequelize").DataTypes;
var _cfg_permission = require("./cfg_permission");
var _cfg_role = require("./cfg_role");
var _con_role_permission = require("./con_role_permission");
var _posts = require("./posts");
var _sources = require("./sources");
var _usage_log = require("./usage_log");
var _usr_role = require("./usr_role");
var _usr_user = require("./usr_user");

function initModels(sequelize) {
  var cfg_permission = _cfg_permission(sequelize, DataTypes);
  var cfg_role = _cfg_role(sequelize, DataTypes);
  var con_role_permission = _con_role_permission(sequelize, DataTypes);
  var posts = _posts(sequelize, DataTypes);
  var sources = _sources(sequelize, DataTypes);
  var usage_log = _usage_log(sequelize, DataTypes);
  var usr_role = _usr_role(sequelize, DataTypes);
  var usr_user = _usr_user(sequelize, DataTypes);

  con_role_permission.belongsTo(cfg_permission, { as: "permission", foreignKey: "permission_id"});
  cfg_permission.hasMany(con_role_permission, { as: "con_role_permissions", foreignKey: "permission_id"});
  con_role_permission.belongsTo(cfg_role, { as: "role", foreignKey: "role_id"});
  cfg_role.hasMany(con_role_permission, { as: "con_role_permissions", foreignKey: "role_id"});
  usr_role.belongsTo(cfg_role, { as: "role", foreignKey: "role_id"});
  cfg_role.hasMany(usr_role, { as: "usr_roles", foreignKey: "role_id"});
  usage_log.belongsTo(usr_user, { as: "user_internal", foreignKey: "user_internal_id"});
  usr_user.hasMany(usage_log, { as: "usage_logs", foreignKey: "user_internal_id"});
  usr_role.belongsTo(usr_user, { as: "user", foreignKey: "user_id"});
  usr_user.hasOne(usr_role, { as: "usr_role", foreignKey: "user_id"});

  return {
    cfg_permission,
    cfg_role,
    con_role_permission,
    posts,
    sources,
    usage_log,
    usr_role,
    usr_user,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
