const embedUtils = require("../../libs/embedUtils.js");

module.exports = {
    builder(CommandBuilder) {
        CommandBuilder
        .setName("help")
        .setDescription("messageCommandの一覧とヘルプを表示します。")
        .addStringOption((option) =>
            option
            .setName("commandname")
            .setDescription("commandの詳細を出したい場合に使用します。")
        )
    },
    cooldown: 0,
    async message(message, logger) {
        const { client, command: thisCmd } = message;
        const { commands } = client;

        if (thisCmd.args.length <= 0) {
            const infos = {};
            commands.forEach((command) => {
                const { category } = command;
                if (typeof infos[category] === "undefined") infos[category] = [];
                infos[category].push(`**${thisCmd.prefix}${command.name}** - ${command.description}`);
            });
            const embed = embedUtils.default()
            .setTitle("messageCommand一覧")
            .addFields(Object.keys(infos).map((category) => ({
                name: category,
                value: infos[category].join("\r")
            })));
            message.reply({ embeds: [embed] });
        } else {
            const command = commands.search(thisCmd.args[0]);
            if (!command) return message.reply(`**${thisCmd.args[0]}**という名前のコマンドが見つかりませんでした。`);
            const info = command.json; //discordのinteractionのjsonと同じ形式
            let title = thisCmd.prefix + info.name;
            const fields = [{
                name: "説明",
                value: info.description
            }];
            if (command.cooldown) {
                fields.push({
                    name: "クールダウン",
                    value: command.cooldown + "秒"
                });
            }
            if (info.type === 1) {
                const subCmd = info.options.find(option => option.name === thisCmd.args[1]);
                if (subCmd) {
                    title += " " + subCmd.name;
                    fields.push({
                        name: "説明",
                        value: subCmd.description
                    });
                    if (subCmd.options) fields.push({
                        name: "引数",
                        value: getOptionInfo(subCmd.options).join("\r")
                    });
                } else {
                    fields.push({
                        name: "サブコマンド",
                        value: info.options.map(option => `**${thisCmd.prefix}${info.name} ${option.name}** - ${option.description}`).join("\r")
                    });
                }
            } else if (info.type === 2) {
                const subCmdGroup = info.options.find(option => option.name === thisCmd.args[1]);
                if (subCmdGroup) {
                    const subCmd = subCmdGroup.options.find(option => option.name === thisCmd.args[2]);
                    if (subCmd) {
                        title += " " + subCmdGroup.name + " " + subCmd.name;
                        fields.push({
                            name: "説明",
                            value: subCmd.description
                        });
                        if (subCmd.options) fields.push({
                            name: "引数",
                            value: getOptionInfo(subCmd.options).join("\r")
                        });
                    } else {
                        title += " " + subCmdGroup.name;
                        fields.push({
                            name: "説明",
                            value: subCmdGroup.description
                        })
                        fields.push({
                            name: "サブコマンド",
                            value: subCmdGroup.options.map(option => `**${thisCmd.prefix}${info.name} ${subCmdGroup.name} ${option.name}** - ${option.description}`).join("\r")
                        });
                    }
                } else {
                    fields.push({
                        name: "サブコマンドグループ",
                        value: info.options.map(option => `**${thisCmd.prefix}${info.name} ${option.name}** - ${option.description}`).join("\r")
                    });
                }
            } else if (info.options) {
                fields.push({
                    name: "引数",
                    value: getOptionInfo(info.options).join("\r")
                });
            }
            const embed = embedUtils.default()
            .setTitle(title)
            .addFields(fields);
            message.reply({ embeds: [embed] });
            console.log(command.json);
        }
    }
};

function getOptionInfo(options) {
    const types = ["", "", "STRING", "INTEGER", "BOOLEAN", "USER", "CHANNEL", "ROLE", "MENTIONABLE", "NUMBER", "ATTACHMENT"];
    const typesJA = ["", "", "文字列", "整数", "真偽値", "ユーザー", "チャンネル", "役職", "メンション可能なもの", "番号", "添付ファイル"];
    let side = ["*がついている引数は必須です。"]
    const editOptions = options.map((option, index) => {
        const type = types[option.type - 1];
        const { name, description, required, choices } = option;
        const res = [index];
        res.push(typesJA[option.type - 1])
        res.push(description);
        switch (type) {
            case "BOOLEAN":
                side.push((index + 1) + "**true**(はい)または**false**(いいえ)を入力してください。");
                break;
            case "USER":
                side.push((index + 1) + "ユーザーのIDまたはメンションを入力してください。");
                break;
            case "CHANNEL":
                side.push((index + 1) + "チャンネルのIDまたはメンションを入力してください。");
                break;
            case "ROLE":
                side.push((index + 1) + "役職のIDまたはメンションを入力してください。");
                break;
            case "MENTIONABLE":
                side.push((index + 1) + "ユーザー、チャンネル、役職のメンションを入力してください。(IDは不可)");
                break;
            case "ATTACHMENT":
                res[0] = options.length;
                break;
        }
        if (choices) res.push("選択肢: " + choices.map((choice) => choice.name).join(", "));
        res[1] = `${name}(${res[1]})${required ? "*" : ""}`;
        return res;
    });
    if (editOptions.length > 0) {
        editOptions.sort((a, b) => a[0] - b[0]);
        editOptions.forEach((option) => option.shift());
        side = side.filter((x, i) => side.indexOf(x) === i);
        return editOptions.map((option, index) => `[${index + 1}] ${option.join("\n- ")}`).join("\n") + "\n\n・" + side.join("\n・")
    }
}