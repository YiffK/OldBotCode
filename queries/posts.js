const sequelize = require('./sequelize')

const findOneBySubmissionID = (submission_id) =>
    sequelize.models.posts.findOne({ where: { submission_id } })

const createNew = (submission_id) =>
    sequelize.models.posts.create({ submission_id })

module.exports = {
    findOneBySubmissionID,
    createNew,
}
