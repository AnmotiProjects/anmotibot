const { Events } = require("discord.js");

module.exports = {
    event: Events.MessageCreate,
    execute: (message, logger) => {
        if (message.author.bot) return;
        
        const command = new Command(message);
        if (typeof command.message !== "function") {
            message.reply("このコマンドはメッセージコマンドに対応していません。\nスラッシュコマンドで使用してください。");
            return;
        };
        if (!command.isCommand) {
            return;
        }
        if (command.isCooldown) {
            return
        }

        message.command = command;

        try {
            command.message(message);
        } catch (error) {
            command.logger.error(error);
        }
    },
};

class Command {
    constructor(message) {
        this.message = message;
        this.client = message.client;
        this.commands = this.client.commands;
        this.config = this.client.config;
        const mentionRegex = new RegExp(`^<@!?${this.client.user.id}>`);
        this.isMention = mentionRegex.test(message.content);
        if (this.isMention) {
            this.prefix = this.config.command.prefixes[0];
            this.content = message.content.replace(mentionRegex, "");
        } else {
            this.prefix = this.config.command.prefixes.find((prefix) => message.content.startsWith(prefix));
            this.content = message.content.slice(this.prefix.length);
        }
        this.args = this.content.split(new RegExp("\\s+")).filter(Boolean);
        this.name = this.args.shift();
        let command = this.commands.search(this.name);
        if (typeof command === "undefined") {
            if (this.isMention) {
                this.name = this.config.command.default;
                command = this.commands.search(this.name);
            } else {
                this.isCommand = false;
            }
        }
        if (typeof this.isCommand === "undefined") this.isCommand = true;
        if (this.isCommand) {
            Object.assign(this, command);
            const userId = message.author.id;
            if (this.cooldowns) { //0などもあり得るのでtypeof this.cooldowns !== "undefined"は使えない
                if (this.cooldowns.has(userId)) {
                    const remaining = this.cooldowns.get(userId) - Date.now();
                    if (0 < remaining) {
                        this.isCooldown = true;
                    } else {
                        this.isCooldown = false;
                    }
                }
                if (typeof this.isCooldown === "undefined") this.isCooldown = false;
                if (!this.isCooldown) this.cooldowns.set(userId, Date.now() + this.cooldown);
            }
        }
    }
}