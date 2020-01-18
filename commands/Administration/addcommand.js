const Command = require("../../base/Command.js"),
Discord = require("discord.js");

class Addcommand extends Command {

    constructor (client) {
        super(client, {
            name: "addcommand",
            description: (language) => language.get("cmd.addcommand.self.description"),
            usage: (language) => language.get("cmd.addcommand.self.usage"),
            examples: (language) => language.get("cmd.addcommand.self.examples"),
            dirname: __dirname,
            enabled: true,
            guildOnly: true,
            aliases: [ "custom-command" ],
            memberPermissions: [ "MANAGE_GUILD" ],
            botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS" ],
            nsfw: false,
            ownerOnly: false,
            cooldown: 3000
        });
    }

    async run (message, args, data) {
        
        let name = args[0].split("\n")[0];
        if(!name){
            return message.channel.send(message.language.get("addcommand.errors.name"));
        }

        if(this.client.commands.get(name) || this.client.aliases.get(name) || data.guild.customCommands.find((c) => c.name === name)){
            return message.channel.send(message.language.get("addcommand.errors.exists", {
                name
            }));
        }

        let answer = (args[0].split("\n")[1] || "") + args.slice(1).join(" ");
        if(!answer){
            return message.channel.send(message.language.get("addcommand.errors.answer"));
        }
        
        data.guild.customCommands.push({
            name: name.toLowerCase(),
            answer: answer
        });
        data.guild.save();
        
        message.channel.send(message.language.get("addcommand.success", {
            name
        }));
    }
    
}

module.exports = Addcommand;
