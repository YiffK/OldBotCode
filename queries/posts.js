const sequelize = require('./sequelize')

const transaction = () => sequelize.transaction()

const findOneBySubmissionID = (submission_id) => sequelize.models.posts.findOne({ where: { submission_id } })

const createNew = (values, options) => sequelize.models.posts.create(values, options)

module.exports = {
    findOneBySubmissionID,
    createNew,
    transaction,
}
