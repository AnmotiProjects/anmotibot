module.exports = {
    builder(CommandBuilder) {
        CommandBuilder
        .setName("ping")
        .setDescription("pingを測定します。");
    },
    cooldown: 0,
    async message(message, logger) {
        const { reply, text } = await ping(message);
        reply.edit(text);
    },
    async interaction(interaction, logger) {
        const { text } = await ping(interaction);
        interaction.editReply(text);
    },
};

async function ping(obj) {
    const base = ":ping_pong:Pong!\r";
    const reply = await obj.reply(base + "取得中...");
    const text = base + [
        `Websocket: ${obj.client.ws.ping}ms`,
        `API Endpoint: ${Date.now() - reply.createdTimestamp}ms`
    ].join("\r");
    return { reply, text };
};