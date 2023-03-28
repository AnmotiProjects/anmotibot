const { EmbedBuilder } = require("discord.js");
const config = require("../config")

module.exports = {
    default() {
        return new EmbedBuilder()
        .setFooter({ text: config.embed.footer });
    }
};