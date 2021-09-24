const sequelize = require('./sequelize');
const { usr_user, usr_role } = sequelize.models;

const findOneByID = (user_id) => usr_user.findOne({ where: { user_id } });

const findUserRole = (user_id) => usr_role.findOne({ where: { user_id } });
const findUserByUsername = (current_username) => usr_user.findOne({ where: { current_username } });
const createUser = () => usr_user.
const createNew = (submission_id) => sequelize.models.posts.create({ submission_id });

module.exports = {
    findOneByID,
    findUserRole,
    createNew,
    findUserByUsername,
};
