module.exports = {
    app_version: '0.0.1',
    app_name: 'Yiffy Corner Bot',
    app_description: 'A bot that automatically posts new yiffy corner posts to the Telegram Channel.',
    app_author: 'Yagdrassyl',
    TOKEN: process.env.TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
    FURAFFINITY_COOKIES: {
        COOKIE_A: process.env.COOKIE_A,
        COOKIE_B: process.env.COOKIE_B,
    },
    CHAT_AT: process.env.CHAT_AT,
};
