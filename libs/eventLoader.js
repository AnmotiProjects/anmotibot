const fs = require("fs");

module.exports = (client) => {
    const { dir } = client.config.event;
    const logger = client.logger.createChannel("event");

    fs.readdirSync(dir).forEach((fileName) => {
        if (!fileName.endsWith(".js")) return;
        const file = require(`../${dir}/${fileName}`);
        const commandLogger = logger.createChild(file.event);
        client.on(file.event, (...args) => {
            file.execute(...args, commandLogger);
        });
        logger.info(`Loaded ${fileName} > ${file.event}`);
    });
};