const sequelize = require('./sequelize')
const { usr_user, usr_role } = sequelize.models

const findOneByID = (user_id) => usr_user.findOne({ where: { user_id } })

const findUserRole = (user_id) => usr_role.findOne({ where: { user_id } })

const createNew = (submission_id) =>
    sequelize.models.posts.create({ submission_id })

module.exports = {
    findOneByID,
    findUserRole,
    createNew,
}
