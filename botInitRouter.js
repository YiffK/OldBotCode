require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf('1758358884:AAE5S8wSSclTWbFli14wiVttUHNofK9As2o');
const { sequelize } = require('./models');
const { User } = require('./queries');
const { Furaffinity, e621, Twitter } = require('./api');
const moment = require('moment');
const cronjob = require('node-cron');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
let logging = false


app.post('/postLinks', async (req, res) => {
    const { password = '', links = '' } = req.body;
    if (password !== 'Esmiwalmart2015') return res.sendStatus(403);
    const batch = Date.now();
    if (logging) {
        bot.telegram.sendMessage(ownerChatId, `Working on batch ${batch}`);
        bot.telegram.sendMessage(ownerChatId, `Bulk submit started from the web ${batch}`);
    }
    let arr = links.split('\n');
    if (!arr) return res.sendStatus(500);
    const results = await processUrls(arr, null, batch);
    res.send(results);
});
// 5 minutes in miliseconds
let time = 5 * 60 * 1000;

function getContext(url) {
    if (url.match(/furaffinity\.net\/view\/[0-9]*(.*)$/)) return Furaffinity;
    else if (url.match(/e621\.net\/posts\/[0-9]*(.*)*$/)) return e621;
    else if (url.match(/twitter\.com\/(.*)\/status\/[0-9]*(.*)$/)) return Twitter;
    else return null;
}
bot.command('logging', (ctx) => {
    logging = ! logging;

    ctx.reply(`Logging set to ${logging}`);
})

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

async function adminOperations(ctx, role) {
    let [_, username] = ctx.update.message.text.split(' ');
    let requester = ctx.update.message.from.username;
    const requesterUser = await User.findUserByUsername(requester);
    const requesterTuple = await User.findUserRole(requesterUser.id);
    if (requesterTuple?.role_id !== 1) return ctx.reply('You are not authorized to use this command!');
    if (username[0] === '@') username = username.slice(1);
    if (requesterUser.current_username === username) return ctx.reply('You cannot use this command on yourself!');

    // First, find the user in the database
    const user = await User.findUserByUsername(username);
    if (!user) return ctx.reply('User not found');

    const user_id = user.id;
    let userTuple = await User.findUserRole(user_id);

    if (!userTuple) {
        await User.createUserRole(user.id, role);
        return ctx.reply('User role created as admin');
    } else {
        if (userTuple.role_id === role) {
            return ctx.reply('User already has this role');
        }
        await userTuple.destroy();
        await User.createUserRole(user.id, role);
        return ctx.reply('User role updated to admin');
    }
}

bot.command(['addadmin', 'addAdmin'], async (ctx) => adminOperations(ctx, 1));
bot.command(['removeadmin', 'removeAdmin'], async (ctx) => adminOperations(ctx, 2));

bot.command('setOwnerChatId', async (ctx) => {
    const { current_username } = await User.findOneByID(ctx.update.message.from.id);
    if (current_username !== 'Yagdrassyl') return ctx.reply('You are not authorized to use this command!');
    ownerChatId = ctx.chat.id;
    ctx.reply('Owner chat id set to ' + ownerChatId);
});

let ownerChatId = 1402476143;
bot.command(['bulksubmit', 'bulkSubmit'], async (ctx) => {
    try {
        const batch = Date.now();
        ctx.reply(`Working on batch ${batch}`);
        const { id: user_id } = await User.findOneByID(ctx.update.message.from.id);
        const userPermissions = await User.findUserRole(user_id);

        if (!userPermissions) return ctx.reply('Only admins can post here!');

        if (userPermissions.role_id !== 1) return ctx.reply('Only admins can post here!');
        ctx.telegram.sendMessage(ownerChatId, `Bulk submit started by ${ctx.chat.first_name} | ${ctx.chat.username}`);

        let arr = ctx.update.message.text.split(' ');
        arr.shift(); // Delete the first command
        if (!arr) return ctx.reply('No urls found!');
        let urls = [...new Set(arr[0].split('\n'))];
        if (!urls) return ctx.reply('No urls found!');
        urls = urls.filter((url) => !!url);
        await processUrls(urls, ctx, batch);
    } catch (error) {
        ctx.telegram.sendMessage(ownerChatId, `Bulk submit failed by ${ctx.chat.first_name} | ${ctx.chat.username}`);
        ctx.telegram.sendMessage(ownerChatId, JSON.stringify(error));
        ctx.reply('There was an error while bulk submitting your posts');
    }
});

function processUrls(arr, ctx = null, batch) {
    return new Promise(async (resolve, reject) => {
        const results = [];
        for (url of arr) {
            results.push(await workURL(url));
        }

        const success = results.filter((res) => res).length;
        if (ctx) {
            ctx.reply(`Batch ${batch} finished with ${success} successes and ${results.length - success} errors`);
        }
        resolve({ success, errors: results.length - success });
    });
}
async function workURL(url) {
    try {
        const context = getContext(url);
        let worker;
        if (context) {
            worker = new context(url);
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
    return ctx.reply('This command is deprecated. Please use /bulkSubmit instead');
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
                `Welcome back @${username} !\n` +
                'What would you like to do today?\n' +
                'Remember that you need admin priviledges to use me!';
        } else {
            msg =
                `Welcome @${username} !\n` +
                `I am a bot created to help managing ${process.env.CHAT_AT} !\n` +
                'You need admin priviledges to use me!';
            const { username: current_username, id: user_id } = ctx.update.message.from;
            const transaction = await sequelize.transaction();
            try {
                user = await sequelize.models.usr_user.create(
                    {
                        role_id: 2,
                        current_username,
                        user_id,
                        create_date: Date.now(),
                    },
                    { transaction }
                );

                const userTuple = await sequelize.models.usr_role.create(
                    {
                        user_id: user.id,
                        role_id: 2,
                    },
                    { transaction }
                );
                await transaction.commit();
            } catch {
                await transaction.rollback();
            }
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
app.listen(port);
