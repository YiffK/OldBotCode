const events = require('events');
const eventEmitter = new events.EventEmitter();

export default function (bot) {
    bot.start(async (ctx) => {});
    bot.command(['startQueue', 'startqueue'], async (ctx) => {});
    bot.command(['extractnow'], async (ctx) => {});
    bot.command(['runqueue', 'runQueue'], async (ctx) => {});
    bot.command(['submitnow, submitNow'], async (ctx) => {});
    bot.command(['count'], async (ctx) => {});
    bot.command(['submit'], async (ctx) => {});
    bot.command(['bulkSubmit', 'bulksubmit'], async (ctx) => {});
    bot.command(['settime, setTime'], async (ctx) => {});
}
