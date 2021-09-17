require('dotenv').config();

const { Telegraf } = require('telegraf');
const bot = new Telegraf('1758358884:AAE5S8wSSclTWbFli14wiVttUHNofK9As2o');
const { sequelize } = require('./models');
const { User } = require('./queries');
const { Furaffinity, e621, Twitter } = require('./api');
const moment = require('moment');
const cronjob = require('node-cron');
// 5 minutes in miliseconds
let time = 5 * 60 * 1000;

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

eventEmitter.on('command', ({ user_internal_id, command }) => {
    // sequelize.models.usage_log.create({
    // })
});

function update_log(user_internal_id, command, success, commandArguments = null) {
    sequelize.models.usage_log.create({
        user_internal_id,
        command,
        arguments: commandArguments,
        success,
    });
}

async function extract(ctx, method, replyToUser = true) {
    if (ctx.chat.type !== 'private') return null;
    let user_id = -1;
    try {
        const { id } = ctx.update.message.from;
        const user = await sequelize.models.usr_user.findOne({
            where: {
                user_id: id.toString(),
            },
        });
        user_id = user?.user_id;
        const [_, url] = ctx.update.message.text.split(' ');
        if (!url) {
            ctx.reply('Invalid url!');
            update_log(user?.id ?? -1, method, false, null);
            return null;
        }
        if (!url.match(/^https:\/\/www.furaffinity.net\/view/gm)) {
            ctx.reply('We only have support for Furaffinity right now!');
            update_log(user?.id ?? -1, method);
            return null;
        }

        const imgPath = await Furaffinity.fetchImage(url);
        if (!imgPath) throw new Error('Image not downloaded');
        if (replyToUser) {
            ctx.replyWithPhoto({ source: imgPath }, { caption: url });
        }
        return { imgPath, url };
    } catch (error) {
        console.log(error);
        ctx.reply('There was an error while managing your request: ', error);
    }
}

function getContext(url) {
    if (url.match(/furaffinity\.net\/view\/[0-9]*(.*)$/)) return Furaffinity;
    else if (url.match(/e621\.net\/posts\/[0-9]*(.*)*$/)) return e621;
    else if (url.match(/twitter\.com\/(.*)\/status\/[0-9]*(.*)$/)) return Twitter;
    else return null;
}

bot.command(['settime', 'setTime'], async (ctx) => {
    let [_, newTime] = ctx.update.message.text.split(' ');
    newTime = Number(newTime);
    if (Number.isNaN(newTime)) {
        ctx.reply('Invalid time!');
        return null;
    }
    const timeInMilliseconds = newTime * 60 * 1000;
    time = timeInMilliseconds;
    ctx.reply('Time set to ' + time + 'ms (' + newTime + ' mins)');
});

bot.command(['bulksubmit', 'bulkSubmit'], async (ctx) => {
    const batch = Date.now();
    ctx.reply(`Working on batch ${batch}`);
    const { id: user_id } = await User.findOneByID(ctx.update.message.from.id);
    const userPermissions = await User.findUserRole(user_id);

    if (!userPermissions) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    if (userPermissions.role_id !== 1) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    let arr = ctx.update.message.text.split(' ');
    arr.shift(); // Delete the first command
    const urls = [...new Set(arr[0].split('\n'))];
    processUrls(urls, ctx, batch);
});

async function processUrls(arr, ctx, batch) {
    const results = [];
    for (url of arr) {
        results.push(await workURL(url, ctx));
    }

    const success = results.filter((res) => res).length;
    ctx.reply(`Batch ${batch} finished with ${success} successes and ${results.length - success} errors`);
}

async function workURL(url, ctx) {
    try {
        const context = getContext(url);
        let worker;
        if (context) {
            worker = new context(ctx, url);
        } else {
            return false;
        }
        const { text: imgURL, success, postID, replacementURL, hasHTTPS, isGif, type } = await worker.extractImageURL();
        if (!imgURL) {
            console.error('Error submitting ', url);
            return false;
        }
        if (!success) {
            return false;
        }
        let currentTime = moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss');
        console.log('\x1b[32m', `[${currentTime}]New submit with url ${imgURL} submitted.`);
        const finalUrl = `${hasHTTPS ? imgURL : `https:${imgURL}`}`;
        const finalObject = JSON.stringify({
            isGif,
            type: type ?? null,
            accompanyingObj: {
                caption: `[Source](${replacementURL || url})\n${process.env.CHAT_AT}`,
            },
        });

        await sequelize.models.queue.create({
            imgURL: imgURL || finalUrl,
            obj: finalObject,
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

bot.command('submit', async (ctx) => {
    try {
        const { id: user_id } = await User.findOneByID(ctx.update.message.from.id);
        const userPermissions = await User.findUserRole(user_id);
    } catch (err) {
        ctx.reply('Sorry, I am programmed to only reply to one person at the moment');
        return null;
    }

    if (!userPermissions) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    if (userPermissions.role_id !== 1) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    let arr = ctx.update.message.text.split(' ');
    arr.splice(0, 2);
    const args = arr.join(' ');
    const [_, url] = ctx.update.message.text.split(' ');
    const context = getContext(url);
    let worker;
    if (context) {
        worker = new context(ctx, url);
    } else {
        ctx.reply(
            'Error in link!\nOnly accepting:\n\t1. Furaffinity Views\n\t2. Twitter Posts with 1 image! (Works, but will always post the first image)'
        );
        return null;
    }

    // Must send the entire URL and return an image URL
    const { text: imgURL, success, postID, replacementURL, hasHTTPS, isGif = false } = await worker.extractImageURL();
    if (!success) {
        ctx.reply(imgURL || 'Error');
        return null;
    }
    let currentTime;
    {
        const today = new Date();
        currentTime = `${today.getFullYear()}-${
            today.getMonth() + 1
        }-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    }
    console.log('\x1b[32m', `[${currentTime}]New submit with url ${imgURL} submitted.`);
    const finalUrl = `${hasHTTPS ? imgURL : `https:${imgURL}`}`;
    const accompanyingObj = {
        caption: `${replacementURL ?? ctx.message.text.split(' ')[1]}\n[${postID}]\n${process.env.CHAT_AT}\n\n ${args ?? ''}`,
    };
    const finalObj = JSON.stringify({
        isGif,
        accompanyingObj,
    });

    sequelize.models.queue.create({
        imgURL: finalUrl,
        obj: finalObj,
    });
    ctx.reply(`Submitted to queue`);

    // await ctx.telegram.sendPhoto(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
    //     caption: `${replacementURL ?? ctx.message.text.split(' ')[1]}\n[${postID}]\n${process.env.CHAT_AT}\n\n ${args ?? ''}`,
    // })
});

const getNumberInQueueModel = () => sequelize.models.queue.count();

bot.command('count', async (ctx) => {
    const numberInQueue = await getNumberInQueueModel(ctx);
    const expectedMinutes = (numberInQueue * time) / 60 / 1000;
    const minutesSinceLastPost = moment().minutes() % 5;
    let expectedTimeOfRunOutPre = moment()
        .add(expectedMinutes - minutesSinceLastPost, 'minutes')
        .utcOffset('-06:00')
        .format('llll');
    ctx.reply(`There are ${numberInQueue} items in the queue. Expected to run until nearing ${expectedTimeOfRunOutPre}`);
});

bot.command(['forceSubmitNow', 'forcesubmitnow'], async (ctx) => {
    const { id: user_id } = await User.findOneByID(ctx.update.message.from.id);
    const userPermissions = await User.findUserRole(user_id);

    if (!userPermissions) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    if (userPermissions.role_id !== 1) {
        ctx.reply('Only admins can post here!');
        return null;
    }
    let arr = ctx.update.message.text.split(' ');
    arr.splice(0, 2);
    const args = arr.join(' ');
    const [_, url] = ctx.update.message.text.split(' ');
    const context = getContext(url);
    let worker;
    if (context) {
        worker = new context(ctx, url, true);
    } else {
        ctx.reply(
            'Error in link!\nOnly accepting:\n\t1. Furaffinity Views\n\t2. Twitter Posts with 1 image! (Works, but will always post the first image)'
        );
        return null;
    }

    // Must send the entire URL and return an image URL
    const { text: imgURL, success, postID, replacementURL, hasHTTPS = true, isGif } = await worker.extractImageURL(true);
    if (!success) {
        ctx.reply(imgURL || 'Error');
        return null;
    }
    let currentTime;
    {
        const today = new Date();
        currentTime = `${today.getFullYear()}-${
            today.getMonth() + 1
        }-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    }
    console.log('\x1b[32m', `[${currentTime}]New submit with url ${imgURL} submitted.`);

    if (!isGif) {
        await ctx.telegram.sendPhoto(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
            caption: `[Source](${replacementURL || url})\n${process.env.CHAT_AT}`,
            parse_mode: 'MarkdownV2',
        });
    } else {
        await ctx.telegram.sendAnimation(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
            caption: `[Source](${replacementURL || url})\n${process.env.CHAT_AT}`,
            parse_mode: 'MarkdownV2',
        });
    }
    ctx.reply(`Sent!`);
});

bot.command('submitNow', async (ctx) => {
    const { id: user_id } = await User.findOneByID(ctx.update.message.from.id);
    const userPermissions = await User.findUserRole(user_id);

    if (!userPermissions) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    if (userPermissions.role_id !== 1) {
        ctx.reply('Only admins can post here!');
        return null;
    }

    let arr = ctx.update.message.text.split(' ');
    arr.splice(0, 2);
    const args = arr.join(' ');
    const [_, url] = ctx.update.message.text.split(' ');
    if (!url) {
        ctx.reply('No arguments!');
        return;
    }
    const context = getContext(url);
    let worker;
    if (context) {
        worker = new context(ctx, url);
    } else {
        ctx.reply(
            'Error in link!\nOnly accepting:\n\t1. Furaffinity Views\n\t2. Twitter Posts with 1 image! (Works, but will always post the first image)'
        );
        return null;
    }

    // Must send the entire URL and return an image URL
    const { text: imgURL, success, postID, replacementURL, hasHTTPS, isGif } = await worker.extractImageURL();
    if (!success) {
        ctx.reply(imgURL || 'Error');
        return null;
    }
    let currentTime;
    {
        const today = new Date();
        currentTime = `${today.getFullYear()}-${
            today.getMonth() + 1
        }-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    }
    console.log('\x1b[32m', `[${currentTime}]New submit with url ${imgURL} submitted.`);

    if (!isGif) {
        await ctx.telegram.sendPhoto(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
            caption: `[Source](${replacementURL || url})\n${process.env.CHAT_AT}`,
        });
    } else {
        await ctx.telegram.sendAnimation(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
            caption: `[Source](${replacementURL || url})\n${process.env.CHAT_AT}`,
        });
    }
    ctx.reply(`Sent!`);
});

bot.command(['sendNow', 'sendnow'], (ctx) => {
    runCronJob();
    ctx.reply('Sent the next item in queue.');
});

function runCronJob() {
    sequelize.models.queue
        .findOne({
            limit: 1,
        })
        .then(async (queued) => {
            const currentTime = moment().utcOffset('-06:00').format('YYYY-MM-DD HH:mm:ss');
            if (!queued) {
                console.log('\x1b[31m', `[${currentTime}][ERROR] Nothing queued!`);
                return null;
            }
            const { imgURL, obj } = queued;
            const parsedObj = JSON.parse(obj);
            const finalUrl = `${imgURL.includes('https') ? imgURL : `https:${imgURL}`}`;
            let success = true;
            try {
                switch (parsedObj.type || null) {
                    case 'webm':
                        await bot.telegram.sendVideo(process.env.CHAT_AT, finalUrl, {
                            ...parsedObj.accompanyingObj,
                            parse_mode: 'MarkdownV2',
                        });
                        break;
                    case 'gif':
                        await bot.telegram.sendAnimation(process.env.CHAT_AT, finalUrl, {
                            ...parsedObj.accompanyingObj,
                            parse_mode: 'MarkdownV2',
                        });
                        break;
                    default:
                        await bot.telegram.sendPhoto(process.env.CHAT_AT, finalUrl, {
                            ...parsedObj.accompanyingObj,
                            parse_mode: 'MarkdownV2',
                        });
                        break;
                }
            } catch (e) {
                console.log(`[${currentTime}] ${e?.response?.description ?? e}`);
                success = false;
            }
            queued.destroy().then(() => {
                if (!success) {
                    console.error(`[${currentTime}][ERROR] Error in runQueue`);
                    runCronJob();
                } else {
                    console.log('\x1b[32m', `[${currentTime}][SUCCESS] Queued item posted and deleted!`);
                }
            });
        });
}

bot.start(async (ctx) => {
    try {
        const { username, id } = ctx.update.message.from;
        user_id = id;
        let msg = '';
        let user = await sequelize.models.usr_user.findOne({
            where: {
                user_id: id.toString(),
            },
        });
        if (user) {
            msg =
                `Welcome back @${username}!\n` +
                'What would you like to do today?\n' +
                '/extract [LINK] - Extracts a picture with a furaffinity link\n' +
                '/submit [LINK] - Extracts a picture from the URL and sends it to the channel';
        } else {
            msg =
                `Welcome @${username}!\n` +
                `I am a bot created to help managing ${process.env.CHAT_AT} !\n` +
                'You can use the following commands to gimme some orders:\n' +
                '/extract - Extracts a picture with a furaffinity link\n' +
                '/submit [LINK] [ANY COMMENT, CAN BE NOTHING] - Sends a pic to the channel :3';
            const { username: current_username, id: user_id } = ctx.update.message.from;
            user = await sequelize.models.usr_user.create({
                current_username,
                user_id,
                create_date: Date.now(),
            });
        }
        // update_log(user.id, 'start', true, null)
        ctx.reply(msg);
    } catch (error) {
        console.log(error);
        // update_log(user_id, 'start', false, error)
    }
});

cronjob.schedule(`*/${time / 60 / 1000} * * * *`, runCronJob);
bot.launch();
