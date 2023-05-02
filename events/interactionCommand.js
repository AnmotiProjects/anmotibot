const { Events } = require("discord.js");

module.exports = {
    event: Events.InteractionCreate,
    execute: (interaction, logger) => {
        const { commands } = interaction.client;
        const { user } = interaction;

        if (!interaction.isChatInputCommand()) return;

        const command = commands.search(interaction.commandName);

        if (command.cooldown) {
            const { cooldowns } = command;
            if (cooldowns.has(user.id)) {
                const remaining = cooldowns.get(user.id) - Date.now();
                if (0 < remaining) {
                    //クールダウン中の終了処理
                    return;
                }
            }
            cooldowns.set(user.id, Date.now() + command.cooldown);
        }

        try {
            command.interaction(interaction, command.logger);
        } catch (error) {
            command.logger.error(error);
            //エラー処理
        }
    }
};