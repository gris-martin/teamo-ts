import getLanguageResource from "./LanguageResource";
import * as Discord from 'discord.js';

export function getHelpMessage(clientUser: Discord.User) {
    let helpEmbed = new Discord.MessageEmbed()
    .setColor("PURPLE")
    .setTitle(`**${getLanguageResource("HELP_TITLE")}**`)
    .setDescription("\n[GitHub](https://github.com/hassanbot/teamo)\n\n" + getLanguageResource("HELP_DESCRIPTION"))
    .addField(getLanguageResource("HELP_FORMAT_TITLE"), getLanguageResource("HELP_FORMAT_FIELD"))
    .addField(getLanguageResource("HELP_EXAMPLE_TITLE"),
        `${clientUser} 5 20:00 League of Legends` + "\n" +
        `${clientUser} 6 14:26 OW` + "\n" +
        `[${getLanguageResource('IN_PRIVATE_MESSAGE')}] 3 16:20 Fortnite`);
    return helpEmbed;
}

export async function handleHelpCommand(channel: Discord.TextChannel | Discord.DMChannel) {
    let helpEmbed = getHelpMessage(channel.client.user);
    let msg = await channel.send(helpEmbed) as Discord.Message;
    msg.delete({ timeout: 60000 }).catch();
}
