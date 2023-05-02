const { Client } = require("discord.js");
const { Logger } = require("dd-logger");
const config = require("./config");

const client = new Client(config.bot.option);
client.logger = new Logger(config.logger);
client.config = config;

const runFunc = [
    require("./libs/eventLoader"),
    require("./libs/commandLoader"),
];
runFunc.forEach((func) => func(client));

client.login(config.bot.token);
