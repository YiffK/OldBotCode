require('dotenv').config();

const { Telegraf } = require('telegraf');
const bot = new Telegraf('1758358884:AAE5S8wSSclTWbFli14wiVttUHNofK9As2o');
const { sequelize } = require('./models');
const { User } = require('./queries');
const { Furaffinity, e621, Twitter } = require('./api');
let universalCTXTelegram = null;
// 15 minutes in miliseconds
let time = 900000;

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
        const { username, id } = ctx.update.message.from;
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

bot.command('extract', async (ctx) => extract(ctx, 'extract'));

bot.command('submitGif', async (ctx) => {
    ctx.telegram.sendAnimation(ctx.update.message.from.id, 'pic.twitter.com/KUIaH93rp2');
    ctx.reply('Sent');
});
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
    ctx.reply('Working...');
    if (!universalCTXTelegram) universalCTXTelegram = ctx;
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

    let results = [];

    for (url of arr) {
        results.push(await workURL(url, ctx));
    }

    const success = results.filter((res) => res).length;

    ctx.reply(`Process finished with ${success} successes and ${results.length - success} errors`);
});

async function workURL(url, ctx) {
    try {
        const context = getContext(url);
        let worker;
        if (context) {
            worker = new context(ctx, url);
        } else {
            return false;
        }
        const { text: imgURL, success, postID, replacementURL, hasHTTPS, isGif } = await worker.extractImageURL();
        if (!imgURL) {
            console.error('Error submitting ', url);
            return false;
        }
        if (!success) {
            return false;
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
        const finalObject = JSON.stringify({
            isGif,
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
    if (!universalCTXTelegram) universalCTXTelegram = ctx;
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

async function getNumberInQueueModel(ctx) {
    return new Promise((resolve, reject) => {
        sequelize.models.queue
            .count()
            .then((res) => {
                resolve(res);
            })
            .catch((err) => reject(err));
    });
}

bot.command('count', async (ctx) => {
    const numberInQueue = await getNumberInQueueModel(ctx);
    ctx.reply(`There are ${numberInQueue} items in the queue`);
});

bot.command('submitNow', async (ctx) => {
    if (!universalCTXTelegram) universalCTXTelegram = ctx;
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
            caption: `${replacementURL ?? ctx.message.text.split(' ')[1]}\n[${postID}]\n${process.env.CHAT_AT}\n\n ${args ?? ''}`,
        });
    } else {
        await ctx.telegram.sendAnimation(process.env.CHAT_AT, `${hasHTTPS ? imgURL : `https:${imgURL}`}`, {
            caption: `${replacementURL ?? ctx.message.text.split(' ')[1]}\n[${postID}]\n${process.env.CHAT_AT}\n\n ${args ?? ''}\n#Gif`,
        });
    }
    ctx.reply(`Sent!`);
});

function runQueue() {
    sequelize.models.queue
        .findOne({
            limit: 1,
        })
        .then(async (queued) => {
            if (!queued) {
                console.log('\x1b[31m', '[ERROR] Nothing queued!');
                setTimeout(() => runQueue(), time);
                return null;
            }
            if (!universalCTXTelegram) {
                console.log('\x1b[31m', '[ERROR] UniversalCTXTelegram not set!');
                setTimeout(() => runQueue(), time);
                return null;
            }
            const { imgURL, obj } = queued;
            const parsedObj = JSON.parse(obj);
            const finalUrl = `${imgURL.includes('https') ? imgURL : `https:${imgURL}`}`;
            let success = true;
            try {
                if (!parsedObj.isGif) {
                    await universalCTXTelegram.telegram.sendPhoto(process.env.CHAT_AT, finalUrl, {
                        ...parsedObj.accompanyingObj,
                        parse_mode: 'MarkdownV2',
                    });
                } else {
                    await universalCTXTelegram.telegram.sendAnimation(process.env.CHAT_AT, finalUrl, {
                        ...parsedObj.accompanyingObj,
                        parse_mode: 'MarkdownV2',
                    });
                }
            } catch (e) {
                console.log(e);
                success = false;
            }
            queued.destroy().then(() => {
                if (!success) {
                    console.error('[ERROR] Error in runQueue');
                    runQueue();
                } else {
                    console.log('\x1b[32m', '[SUCCESS] Queued item posted and deleted!');
                    setTimeout(() => runQueue(), time);
                }
            });
        });
}

bot.command('extractNow', async (ctx) => {
    const [_, url] = ctx.update.message.text.split(' ');
    const context = getContext(url);
    let worker;
    if (context) {
        worker = new context(ctx, url);
    } else {
        return false;
    }
    const { text: imgURL, success, hasHTTPS, isGif } = await worker.extractImageURL();
    if (!imgURL) {
        console.error('Error submitting ', url);
        return false;
    }
    if (!success) {
        ctx.reply(imgURL);
        return false;
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
    if (!isGif) {
        ctx.telegram.sendPhoto(ctx.update.message.chat.id, finalUrl);
    } else {
        ctx.telegram.sendAnimation(ctx.update.message.chat.id, finalUrl);
    }
});

bot.command(['startQueue', 'startqueue'], async (ctx) => {
    if (!universalCTXTelegram) universalCTXTelegram = ctx;
    const numberInQueue = await getNumberInQueueModel(ctx);
    // Subtime variable with 15 minutes in ms
    runQueue();
    ctx.reply('Queue started!');
});

bot.start(async (ctx) => {
    let user_id = -1;
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
            });
        }
        // update_log(user.id, 'start', true, null)
        if (!universalCTXTelegram) universalCTXTelegram = ctx;
        universalCTXTelegram.reply(msg);
    } catch (error) {
        console.log(error);
        // update_log(user_id, 'start', false, error)
    }
});

bot.launch();
