import * as Discord from 'discord.js';
import { config } from './config';
import getLanguageResource from './LanguageResource';
import { getAdjustedDate } from './TimeUtils';
import { TeamoCommandWaiting } from './TeamoCommandWaiting';

const client = new Discord.Client();

client.on('ready', () => {
    console.log("Bot online!");
    client.user.setActivity("!teamo for usage info", { type: 'PLAYING' });
});

client.on('message', msg => {
    if (msg.author.bot)
        return;

    if (!msg.content.startsWith(config.prefix))
        return;

    const command = msg.content.split(" ")[0].replace(config.prefix, "");
    if (command.toLowerCase() !== "teamo")
        return;

    handleCommand(msg);
});


async function handleHelpCommand(channel: Discord.TextChannel | Discord.DMChannel, isWelcomeMessage: boolean = false) {
    let helpEmbed = new Discord.MessageEmbed()
        .setColor("PURPLE")
        .setTitle(`**${getLanguageResource("HELP_TITLE")}**`)
        .setDescription("\n[GitHub](https://github.com/hassanbot/teamo)\n\n" + getLanguageResource("HELP_DESCRIPTION"))
        .addField(getLanguageResource("HELP_FORMAT_TITLE"), getLanguageResource("HELP_FORMAT_FIELD"))
        .addField(getLanguageResource("HELP_EXAMPLE_TITLE"),
            "!teamo 5 20:00 League of Legends\n" +
            "!teamo 6 14:26 OW");
    if (!isWelcomeMessage)
        helpEmbed.setFooter(getLanguageResource("HELP_FOOTER"));

    let msg = await channel.send(helpEmbed) as Discord.Message;

    if (!isWelcomeMessage)
        msg.delete({ timeout: 60000 });

}

type MainCommandArgs = {
    args: string,
    channel: Discord.TextChannel,
    author: Discord.User,
    updateInterval: number
}

async function handleMainCommand(args: MainCommandArgs): Promise<boolean> {
    // Validate arguments
    const argsArray = args.args.match(/(\d+)\s(\d{1,2})[:.]?(\d{2})\s(.+)/);
    if (argsArray === null) {
        (await args.channel.send(getLanguageResource("ARGS_PLAY_INVALID_FORMAT")) as Discord.Message)
            .delete({ timeout: 10000 });
        return false;
    }
    const maxPlayers = parseInt(argsArray[1]);
    const hh = parseInt(argsArray[2]);
    const mm = parseInt(argsArray[3]);
    const game = argsArray[4];
    const date = getAdjustedDate(hh, mm);

    const teamoWaiting = new TeamoCommandWaiting(maxPlayers, date, game, args.author, client);
    await teamoWaiting.sendNewMessage(args.channel);
    return true;
}

// Handle commands
async function handleCommand(msg: Discord.Message | Discord.PartialMessage) {
    const args = msg.content.substr(msg.content.indexOf(' ') + 1);
    console.log(`Args is \"${args}\"`);
    let updateInterval = 15;

    if (config.useSpecificChannel && msg.channel.id !== config.channelID)
    {
        let wrongChannelMsg = await msg.channel.send(`${getLanguageResource("WRONG_CHANNEL")} ${client.channels.get(config.channelID)}`);
        wrongChannelMsg.delete({timeout: 10000}).catch();
    }
    else if (args === "!teamo" || args.toLowerCase() === "help") {
        await handleHelpCommand(msg.channel);
    }
    else if (args === "welcome") {
        await handleHelpCommand(msg.channel, true);
    }
    else {
        const mainCommandArgs = {
            args: args,
            channel: msg.channel as Discord.TextChannel,
            author: msg.author,
            updateInterval: updateInterval
        }
        await handleMainCommand(mainCommandArgs);
    }
    msg.delete({timeout: 10000}).catch();
}

client.login(config.token);
