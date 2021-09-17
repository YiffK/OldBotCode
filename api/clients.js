// showLastCommitMessageForThisLibrary.js
const { create } = require('apisauce');

// define the api
const furaffinity = create({
    baseURL: 'https://www.furaffinity.net',
    headers: {
        Cookie: `a=${process.env.COOKIE_A}; b=${process.env.COOKIE_B}`,
    },
});

const e621 = create({
    baseURL: 'https://e621.net/posts/',
    headers: {
        Cookie: 'gw=seen',
        'User-Agent': 'YiffyCornerBot',
    },
});
// Regex to extract twitter API /\/tweets\/[0-9]*/gm
// To extract the ID from it: /\/[0-9]*$/
// To extract it from the tweet: /status\/[0-9][0-9]*\//
// To extract the ID: /[0-9][0-9]*/gm
const twitter = create({
    baseURL: 'https://api.twitter.com/2/tweets/',
    headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
    },
});

module.exports = {
    furaffinity,
    e621,
    twitter,
};
