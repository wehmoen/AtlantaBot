const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Addemote extends Command {

    constructor (client) {
        super(client, {
            name: "addemote",
            description: (language) => language.t("cmd.addemote.usage"),
            usage: (language) => language.t("cmd.addemote.usage"),
            examples: (language) => language.t("cmd.addemote.examples"),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [],
            memberPermissions: [ "MANAGE_GUILD" ],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 5000
        });
    }

    async run (message, args, data) {

        let url = args[0];
        if(!url){
            return message.channel.send(message.language.t("cmd.addemote.url"));
        }

        let name = args[1];
        if(!name){
            return message.channel.send(message.language.t("cmd.addemote.name"));
        }

        message.guild.emojis.create(url, name).then((emote) => {
            message.channel.send(message.language.t("cmd.addemote.success", {
                emoteName: emote.name,
                emoteString: emote.toString()
            }));
        }).catch((err) => {
            return message.channel.send(message.language.t("cmd.addemote.full"));
        });
    }

}

module.exports = Addemote;