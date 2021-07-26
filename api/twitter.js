const { twitter } = require('./clients')
const ImageFetcher = require('./imageFetcher')
const { Posts } = require('../queries')
const fields =
    '?tweet.fields=entities&expansions=attachments.media_keys&media.fields=url'

class Twitter extends ImageFetcher {
    extractSubstring() {
        //Status substring
        const regex = /status\/([0-9]*)/
        return this.url.match(regex)[1]
    }

    async extractImageURL() {
        try {
            const submission_id = this.extractSubstring()
            const repost = await Posts.findOneBySubmissionID(submission_id)
            if (repost?.source_id === 3)
                throw new Error('This image has already been posted')
            const post = await Posts.createNew({ submission_id, source_id: 3 })
            let finalURL = submission_id + fields
            const result = await twitter.get(finalURL, null, {
                withCredentials: true,
            })

            const urlContainer = result.data.includes.media[0].url
            const replacementURL = result.data.data.entities.urls[0].url
            return {
                text: urlContainer,
                success: true,
                postID: post.id,
                replacementURL,
                hasHTTPS: true,
            }
        } catch (e) {
            return {
                success: false,
                text: e.message ?? e,
            }
        }
    }
}

module.exports = Twitter
