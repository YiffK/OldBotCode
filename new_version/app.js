const { Telegraf } = require('telegraf');
const configurationObject = require('./config');
const bot = new Telegraf(configurationObject.TOKEN);
const sequelize = require('./models/sequelize');
