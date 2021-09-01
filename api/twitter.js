const { twitter } = require('./clients');
const ImageFetcher = require('./imageFetcher');
const { Posts } = require('../queries');
const fields = '?tweet.fields=entities,source&expansions=attachments.media_keys&media.fields=url';

class Twitter extends ImageFetcher {
    extractSubstring() {
        //Status substring
        const regex = /status\/([0-9]*)/;
        return this.url.match(regex)[1];
    }

    async extractImageURL() {
        try {
            const submission_id = this.extractSubstring();
            const repost = await Posts.findOneBySubmissionID(submission_id);
            if (repost?.source_id === 3) throw new Error('This image has already been posted');
            let finalURL = submission_id + fields;
            const result = await twitter.get(finalURL, null, { withCredentials: true });
            // const index = Number(this.url.match(/photo\/([0-9]*)/)[1]) - 1
            let urlContainer = this.url;
            let isGif = false;

            if (result.data.includes.media[0].type === 'animated_gif') {
                urlContainer = result.data.data.entities.urls[0].display_url;
                isGif = true;
            }

            const post = await Posts.createNew({ submission_id, source_id: 3 });
            return {
                text: urlContainer,
                success: true,
                postID: post.id,
                replacementURL: this.url,
                hasHTTPS: true,
                isGif,
            };
        } catch (e) {
            const currentTime = moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss');

            if (e.message === 'Validation error') e.message = `[${currentTime}] This image has already been posted`;
            return {
                success: false,
                text: e.message === 'Validation error' ? `[${currentTime}] This image has already been posted` : e.message,
            };
        }
    }
}

module.exports = Twitter;
