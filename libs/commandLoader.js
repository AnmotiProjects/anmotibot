const { Collection, SlashCommandBuilder, REST, Routes } = require("discord.js");
const fs = require("fs");

module.exports = (client) => {
    const { config } = client;
    const { dir } = config.command;

    const logger = client.logger.createChannel("command");

    client.commands = new Collection();
    client.commands.prefixes = config.command.prefixes;
    client.commands.mention = config.command.mention;
    client.commands.search = (name) => {
        return (
            client.commands.get(name) ||
            client.commands.find((command) => command.aliases && command.aliases.includes(name))
        );
    };

    fs.readdirSync(dir).forEach((folder) => {
        const folderPath = `${dir}/${folder}/`;
        const categoryLogger = logger.createChild(folder);
        fs.readdirSync(folderPath).forEach((file) => {
            if (!file.endsWith(".js")) return;
            const command = {
                ...require("../" + folderPath + file),
                category: capitalizeFirstLetter(folder.toLowerCase())
            };
            const builderData = new SlashCommandBuilder();
            command.builder(builderData);
            command.json = builderData.toJSON();
            Array("name", "description").forEach((eName) => {
                command[eName] = command.json[eName];
            });
            command.logger = categoryLogger.createChild(command.name);
            if (command.cooldown) command.cooldowns = new Collection();
            client.commands.set(command.name, command);
            logger.info(`Loaded ${folder} > ${command.name}`);
        });
    });

    slashCommands = client.commands
    .map((command) => {
        if (typeof command.interaction === "function") return command.json;
    })
    .filter(obj => typeof obj !== "undefined");

    new REST({ version: "10" })
    .setToken(config.bot.token)
    .put(Routes.applicationCommands(config.bot.id), { body: slashCommands });
};

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
