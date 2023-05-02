module.exports = {
    builder(CommandBuilder) {
        CommandBuilder
        .setName("test")
        .setDescription("テスト用のコマンド");
    },
    cooldown: 0,
    async message(message, logger) {

    },
    async interaction(interaction, logger) {

    },
};