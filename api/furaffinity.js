const { furaffinity } = require('./clients')
const ImageFetcher = require('./imageFetcher')
const { Posts } = require('../queries')

class Furaffinity extends ImageFetcher {
    extractSubstring() {
        const subURL = this.url.substring(this.url.search('/view'))
        let submissionId = subURL.substring(subURL.substring(1).indexOf('/') + 1)

        try {
            submissionId = submissionId.replaceAll('/', '')
        } catch (error) {
            while (submissionId.indexOf('/') !== -1) {
                submissionId = submissionId.replace('/', '')
            }
        }
        return [subURL, submissionId]
    }

    isolateURL(result) {
        //     let urlContainer = result.data.match(/<img id=\"submissionImg\".*\ src=(.*)>/gm)
        //     if (urlContainer) urlContainer = urlContainer[0]
        //     else throw 'Could not find image'

        //     let [_, sub, extension] = urlContainer.match(/\ src\=\"(.*)\.(.*)\"/)
        //     extension = extension.match(/(.*)\"\ /)[1]

        //     if (!sub || !extension) throw 'Could not find image'
        //     return `${sub}.${extension}`
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
        const t = await Posts.transaction()
        try {
            const [subURL, submission_id] = this.extractSubstring()
            const repost = await Posts.findOneBySubmissionID(submission_id)
            if (repost) throw new Error('This image has already been posted.')
            let post
            try {
                post = await Posts.createNew({ submission_id, source_id: 1 }, { transaction: t })
            } catch (error) {
                throw error
            }
            if (!post) throw new Error('Error creating a post for this! Cookies might be invalid!')
            const result = await furaffinity.get(subURL, null, {
                withCredentials: true,
            })

            const urlContainer = this.isolateURL(result)
            t.commit()
            return {
                text: urlContainer,
                success: true,
                postID: post.id,
            }
        } catch (error) {
            t.rollback()
            return {
                success: false,
                text: error.message ?? error,
            }
        }
    }
}

module.exports = Furaffinity
