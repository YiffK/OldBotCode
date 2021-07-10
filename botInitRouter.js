require('dotenv').config()

const {Telegraf} = require('telegraf')
const bot = new Telegraf('1758358884:AAE5S8wSSclTWbFli14wiVttUHNofK9As2o')
const {sequelize} = require('./models/getModels')
const {User} = require('./queries')
const {Furaffinity, e621, Twitter} = require('./api')

function update_log(
    user_internal_id,
    command,
    success,
    commandArguments = null,
) {
    sequelize.models.usage_log.create({
        user_internal_id,
        command,
        arguments: commandArguments,
        success,
    })
}

async function extract(ctx, method, replyToUser = true) {
    if (ctx.chat.type !== 'private') return null
    let user_id = -1
    try {
        const {username, id} = ctx.update.message.from
        const user = await sequelize.models.usr_user.findOne({
            where: {
                user_id: id.toString(),
            },
        })
        user_id = user?.user_id
        const [_, url] = ctx.update.message.text.split(' ')
        if (!url) {
            ctx.reply('Invalid url!')
            update_log(user?.id ?? -1, method, false, null)
            return null
        }
        if (!url.match(/^https:\/\/www.furaffinity.net\/view/gm)) {
            ctx.reply('We only have support for Furaffinity right now!')
            update_log(user?.id ?? -1, method)
            return null
        }

        const imgPath = await Furaffinity.fetchImage(url)
        if (!imgPath) throw new Error('Image not downloaded')
        if (replyToUser) {
            ctx.replyWithPhoto({source: imgPath}, {caption: url})
        }
        return {imgPath, url}
    } catch (error) {
        console.log(error)
        ctx.reply('There was an error while managing your request: ', error)
    }
}

bot.command('extract', async (ctx) => extract(ctx, 'extract'))

function getContext(url) {
    if (url.match(/furaffinity\.net\/view\/[0-9]*(.*)$/)) return Furaffinity
    else if (url.match(/e621\.net\/posts\/[0-9]*(.*)*$/)) return e621
    else if (url.match(/twitter\.com\/(.*)\/status\/[0-9]*(.*)$/)) return Twitter
    else return null
}

bot.command('submit', async (ctx) => {
    const {id: user_id} = await User.findOneByID(ctx.update.message.from.id)
    const userPermissions = await User.findUserRole(user_id)

    if (!userPermissions) {
        ctx.reply('Only admins can post here!')
        return null
    }

    if (userPermissions.role_id !== 1) {
        ctx.reply('Only admins can post here!')
        return null
    }
    let arr = ctx.update.message.text.split(' ')
    arr.splice(0, 2)
    const args = arr.join(' ')

    const [_, url] = ctx.update.message.text.split(' ')
    const context = getContext(url)
    let worker
    if (context) {
        worker = new (getContext(url))(ctx, url)

    } else {
        ctx.reply('Error in link!\nOnly accepting:\n\t1. Furaffinity Views\n\t2. Twitter Posts with 1 image! (Works, but will always post the first image)')
        return null
    }

    // Must send the entire URL and return an image URL
    const {text: imgURL, success, postID, replacementURL} = await worker.extractImageURL()
    if (!success) {
        ctx.reply(imgURL || 'Error')
        return null
    }
    await ctx.telegram.sendPhoto(process.env.CHAT_AT, `${replacementURL ?? `https:${imgURL}`}`, {
        caption: `${ctx.message.text.split(' ')[1]}\n[${postID}]\n${
            process.env.CHAT_AT
        }\n\n${args}`,
    })
    ctx.reply('Sent!')
})

bot.start(async (ctx) => {
    let user_id = -1
    try {
        const {username, id} = ctx.update.message.from
        user_id = id
        let msg = ''
        let user = await sequelize.models.usr_user.findOne({
            where: {
                user_id: id.toString(),
            },
        })
        if (user) {
            msg =
                `Welcome back @${username}!\n` +
                'What would you like to do today?\n' +
                '/extract [LINK] - Extracts a picture with a furaffinity link\n' +
                '/submit [LINK] - Extracts a picture from the URL and sends it to the channel'
        } else {
            msg =
                `Welcome @${username}!\n` +
                `I am a bot created to help managing ${channelLink} !\n` +
                'You can use the following commands to gimme some orders:\n' +
                '/extract - Extracts a picture with a furaffinity link'
            const {username: current_username, id: user_id} =
                ctx.update.message.from
            user = await sequelize.models.usr_user.create({
                current_username,
                user_id,
            })
        }
        update_log(user.id, 'start', true, null)
        ctx.reply(msg)
    } catch ({message: error}) {
        update_log(user_id, 'start', false, error)
    }
})

bot.launch()
