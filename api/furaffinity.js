const { furaffinity } = require('./clients')
const ImageFetcher = require('./imageFetcher')
const { sequelize } = require('../models/init-models')
const { Posts } = require('../queries')

class Furaffinity extends ImageFetcher {
    extractSubstring() {
        const subURL = this.url.substring(this.url.search('/view'))
        let submissionId = subURL.substring(
            subURL.substring(1).indexOf('/') + 1,
        )
        submissionId = submissionId.replaceAll('/', '')
        return [subURL, submissionId]
    }

    isolateURL(result) {
        let urlContainer = ''
        let beginning, end
        end = result.data.search('Download')
        if (!end) return null

        urlContainer = result.data.substring(0, end)
        beginning = urlContainer.lastIndexOf('<')
        urlContainer = urlContainer.substring(beginning)
        beginning = urlContainer.indexOf('"') + 1
        end = urlContainer.lastIndexOf('"')
        urlContainer = urlContainer.substring(beginning, end)
        return urlContainer
    }

    async extractImageURL() {
        try {
            const [subURL, submission_id] = this.extractSubstring()
            const repost = await Posts.findOneBySubmissionID(submission_id)
            if (repost) {
                throw new Error('This image has already been posted.')
            }
            const post = await Posts.createNew(submission_id)

            const result = await furaffinity.get(subURL, null, {
                withCredentials: true,
            })

            const urlContainer = this.isolateURL(result)
            return {
                text: urlContainer,
                success: true,
                postID: post.id,
            }
        } catch (error) {
            return {
                success: false,
                imgURL: error,
            }
        }
    }
}

module.exports = Furaffinity
