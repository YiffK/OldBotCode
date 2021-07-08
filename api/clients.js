// showLastCommitMessageForThisLibrary.js
const { create } = require('apisauce')

// define the api
const furaffinity = create({
    baseURL: 'https://www.furaffinity.net',
    headers: {
        Cookie: `a=${process.env.COOKIE_A}; b=${process.env.COOKIE_B}`,
    },
})

const e621 = create({
    baseURL: 'https://www.e621.net',
    headers: {
        Cookie: 'gw=seen',
    },
})

module.exports = {
    furaffinity,
    e621,
}
