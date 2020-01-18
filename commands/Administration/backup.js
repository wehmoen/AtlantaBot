const Command = require("../../base/Command.js"),
Discord = require("discord.js"),
backup = require("discord-backup");

class Backup extends Command {

    constructor (client) {
        super(client, {
            name: "backup",
            description: (language) => language.t("cmd.backup.self.description"),
            usage: (language) => language.t("cmd.backup.self.usage"),
            examples: (language) => language.t("cmd.backup.self.examples"),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "sauvegarde" ],
            memberPermissions: [ "MANAGE_GUILD" ],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS", "ADMINISTRATOR" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 30000
        });
    }

    async run (message, args, data) {

        let status = args[0];
        if(!status){
            return message.channel.send(message.language.t("cmd.backup.errors.status"));
        }

        if(status === "create"){
            backup.create(message.guild).then((backupID) => {
                message.channel.send(message.language.t("cmd.backup.success"));
                message.author.send(message.language.t("cmd.backup.successID", {
                    backupID
                }));
            }).catch(() => {
                return message.channel.send(message.language.t("cmd.errors.unknown"));
            });
        } else if (status === "load"){
            let backupID = args[1];
            if(!backupID){
                return message.channel.send(message.language.t("cmd.backup.errors.id"));
            }
            backup.fetch(backupID).then(async () => {
                message.channel.send(message.language.t("cmd.backup.confirmation"));
                await message.channel.awaitMessages(m => (m.author.id === message.author.id) && (m.content === "-confirm"), {
                    max: 1,
                    time: 20000,
                    errors: ["time"]
                }).catch(() => {
                    // if the author of the commands does not confirm the backup loading
                    return message.channel.send(message.language.t("cmd.backup.errors.timeout"));
                });
                // When the author of the command has confirmed that he wants to load the backup on his server
                message.author.send(message.language.t("cmd.backup.start"));
                // Load the backup
                backup.load(backupID, message.guild).then(() => {
                    // When the backup is loaded, delete them from the server
                    backup.remove(backupID);
                    message.author.send(message.language.t("cmd.backup.loaded"));
                }).catch(() => {
                    // If an error occurenced
                    return message.author.send(message.language.t("cmd.errors.unknown"));
                });
            }).catch(() => {
                // if the backup wasn't found
                return message.channel.send(message.language.t("cmd.backup.errors.notFound", {
                    backupID
                }));
            });
        } else if (status === "infos"){
            let backupID = args[1];
            if(!backupID){
                return message.channel.send(message.language.t("cmd.backup.errors.id"));
            }
            backup.fetch(backupID).then(async (backupInfos) => {
                let embed = new Discord.MessageEmbed()
                    .setAuthor(message.language.t("cmd.backup.titles.info"))
                    // Display the backup ID
                    .addField(message.language.t("cmd.backup.titles.id"), backupInfos.id, true)
                    // Displays the server from which this backup comes
                    .addField(message.language.t("cmd.backup.titles.server"), backupInfos.data.guildID, true)
                    // Display the size (in mb) of the backup
                    .addField(message.language.t("cmd.backup.titles.size"), backupInfos.size+" mb", true)
                    // Display when the backup was created
                    .addField(message.language.t("cmd.backup.titles.createdAt"), message.language.printDate(new Date(backupInfos.data.createdTimestamp)), true)
                    .setColor(data.config.embed.color)
                    .setFooter(data.config.embed.footer);
                message.channel.send(embed);
            }).catch((err) => {
                // if the backup wasn't found
                return message.channel.send(message.language.t("cmd.backup.errors.notFound", {
                    backupID
                }));
            });
        } else {
            return message.channel.send(message.language.t("cmd.backup.errors.status"));
        }
        
    }

}

module.exports = Backup;