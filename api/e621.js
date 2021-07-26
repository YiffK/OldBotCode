const { sequelize } = require('../models/init-models')
const { e621: client } = require('./clients')
const htmlToJson = require('html-to-json')
const ImageFetcher = require('./imageFetcher')
const { Posts } = require('../queries')

class e621 extends ImageFetcher {
    extractSubstring() {
        try {
            let beginning
            beginning = this.url.search('/posts') + 1

            let tempURL = this.url.substring(beginning)
            let submissionId = tempURL.substring(tempURL.indexOf('/') + 1)

            if (tempURL.includes('?')) {
                tempURL = tempURL.substring(0, tempURL.indexOf('?'))
                submissionId = submissionId.substring(
                    0,
                    submissionId.indexOf('?'),
                )
            }
            //posts/32409834
            return [tempURL, submissionId]
        } catch (error) {
            console.log(error)
        }
    }

    async isolateURL({ data: result }) {
        let beginning, end
        beginning = result.search('image-download-link')
        return final
    }

    async extractImageURL() {
        try {
            const [subURL, submission_id] = this.extractSubstring()
            const repost = await Posts.findOneBySubmissionID(submission_id)

            if (repost) {
                throw new Error('This image has already been posted')
            }

            const post = await Posts.createNew(submission_id)

            const result = await client.get(subURL, null, {
                withCredentials: true,
            })

            const urlContainer = this.isolateURL(result)
        } catch (error) {
            console.log(error)
            return {
                success: false,
            }
        }
    }
}

module.exports = e621
