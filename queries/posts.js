const sequelize = require('./sequelize')

const findOneBySubmissionID = (submission_id) =>
    sequelize.models.posts.findOne({where: {submission_id}})

const createNew = (values) =>
    sequelize.models.posts.create(values)

module.exports = {
    findOneBySubmissionID,
    createNew,
}
