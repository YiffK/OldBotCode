const { e621: client } = require('./clients');
const ImageFetcher = require('./imageFetcher');
const { Posts } = require('../queries');
const moment = require('moment');

class e621 extends ImageFetcher {
    extractSubstring() {
        return this.url.match(/e621\.net\/posts\/([0-9]*)/)[1];
    }

    findURL(sources) {
        const possibleRegs = [
            /twitter\.com\/([a-z0-9A-Z]*)\/status\//,
            /twitter\.com\/([a-z0-9A-Z]*)/,
            /furaffinity\.net\/view\//,
            /furaffinity\.net\/user\//,
        ];

        for (const reg of possibleRegs) {
            for (const source of sources) {
                if (reg.exec(source)) return source;
            }
        }
        for (const source of sources) {
            for (const extension of ['.gif', '.png', '.jpeg', '.jpg']) {
                if (!source.includes(extension)) return source;
            }
        }
        return sources[0];
    }

    async extractImageURL(forceIfRepost = true) {
        let t;
        if (!forceIfRepost) t = await Posts.transaction();
        try {
            const submission_id = this.extractSubstring();
            if (!forceIfRepost) {
                const repost = await Posts.findOneBySubmissionID(submission_id);
                if (repost) {
                    const currentTime = moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss');
                    throw new Error(`[${currentTime}] This image has already been posted`);
                }
                const created_at = moment().utcOffset('-06:00').format('YYYY-MM-DD hh:mm:ss');
                const post = await Posts.createNew({ submission_id, source_id: 2, created_at }, { transaction: t });
                if (!post) throw new Error('Error creating post');
            }

            const petition = `${submission_id}.json`;
            const result = await client.get(petition);
            let sources = undefined;
            let text = undefined;
            let type = undefined;

            if (result.data?.post) {
                sources = result.data.post;
                text = result.data.post.file;
                type = result.data.post.file;
            }
            // Prefer Twitter over Furaffinity Over
            let replacementURL = sources?.length ? this.findURL(sources) : this.url;
            if (!text) text = replacementURL;
            if (!forceIfRepost) t.commit();
            return {
                text,
                success: true,
                isGif: false,
                replacementURL,
                type,
            };
        } catch (e) {
            if (e.message === 'Validation error') e.message = `${this.url} has already been posted`;
            console.log(e.message || e);
            if (!forceIfRepost) t.rollback();
            const currentTime = moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss');
            return {
                success: false,
                text: e.message === 'Validation error' ? `[${currentTime}] This image has already been posted` : e.message,
            };
        }
    }
}

module.exports = e621;
