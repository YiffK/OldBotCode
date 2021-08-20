const { sequelize } = require('../models/init-models');
const { e621: client } = require('./clients');
const htmlToJson = require('html-to-json');
const ImageFetcher = require('./imageFetcher');
const { Posts } = require('../queries');

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

    async extractImageURL() {
        const t = await Posts.transaction();
        try {
            const submission_id = this.extractSubstring();
            const repost = await Posts.findOneBySubmissionID(submission_id);
            if (repost) throw new Error('This image has already been posted');

            const post = await Posts.createNew({ submission_id, source_id: 2 }, { transaction: t });

            if (!post) throw new Error('Error creating post');
            const petition = `${submission_id}.json`;
            const result = await client.get(petition);
            const text = result.data.post.file.url;
            const { sources } = result.data.post;
            // Prefer Twitter over Furaffinity Over
            let replacementURL = sources.length ? this.findURL(sources) : this.url;
            t.commit();
            return {
                text,
                success: true,
                postID: post.id,
                isGif: false,
                replacementURL,
            };
        } catch (e) {
            if (e.message === 'Validation error') e.message = `${this.url} has already been posted`;
            console.log(e.message || e);
            t.rollback();
            return {
                success: false,
                text: e.message === 'Validation error' ? 'This image has already been posted' : e.message,
            };
        }
    }
}

module.exports = e621;
