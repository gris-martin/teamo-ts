import * as Discord from 'discord.js';
import { config } from './config';
import getLanguageResource from './LanguageResource';
import { getAdjustedDate } from './TimeUtils';
import { TeamoCommandWaiting } from './TeamoCommandWaiting';
import { handleHelpCommand } from './HelpCommand';
import { handlePurgeCommand } from './PurgeCommand';
import { handleWelcomeCommand } from './WelcomeCommand';

const client = new Discord.Client();

client.on('ready', () => {
    console.log("Bot online!");
    client.user.setActivity("DM 'help' for usage info", { type: 'PLAYING' });
    handlePurgeCommand(client.channels.get(config.channelID) as Discord.TextChannel);
});

client.on('message', msg => {
    if (msg.author.bot)
        return;

    if (!msg.mentions.users.get(msg.client.user.id) && !(msg.channel.type == 'dm'))
    {
        if (msg.channel.id === config.channelID)
        {
            msg.channel.send(`${getLanguageResource("ONLY_MESSAGE_TO_TEAMO_1")} ${client.user} ${getLanguageResource("ONLY_MESSAGE_TO_TEAMO_2")}.`)
                .then(sentMsg => sentMsg.delete({timeout: 5000}).catch());
            msg.delete({timeout: 5000}).catch();
        }
        return;
    }

    handleCommand(msg);
});


type MainCommandArgs = {
    args: string,
    channel: Discord.TextChannel,
    author: Discord.User,
    updateInterval: number
}

async function handleMainCommand(args: MainCommandArgs): Promise<boolean> {
    // Validate arguments
    const argsArray = args.args.match(/(\d+)\s(\d{1,2})[:.]?(\d{2})\s(.+)/);
    const teamoChannel = client.channels.get(config.channelID);
    if (argsArray === null) {
        const invalidMsg1 = getLanguageResource('ARGS_PLAY_INVALID_FORMAT_1');
        const invalidMsg2 = getLanguageResource('ARGS_PLAY_INVALID_FORMAT_2');
        const invalidMsg = `${invalidMsg1} ${teamoChannel} ${invalidMsg2}`;
        let sentMsg = await args.channel.send(invalidMsg) as Discord.Message;
        if (args.channel.type !== 'dm')
            sentMsg.delete({ timeout: 10000 });
        return false;
    }

    const maxPlayers = parseInt(argsArray[1]);
    if (maxPlayers > 10 || maxPlayers < 2) {
        (await args.channel.send(getLanguageResource("INVALID_MAX_PLAYERS"))).delete({timeout: 10000}).catch();
        return false;
    }

    const hh = parseInt(argsArray[2]);
    const mm = parseInt(argsArray[3]);
    if (hh === NaN || mm === NaN || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        (await args.channel.send(getLanguageResource("INVALID_TIME"))).delete({timeout: 10000}).catch();
        return false;
    }

    const game = argsArray[4];
    if (game.length > 40) {
        (await args.channel.send(getLanguageResource("INVALID_GAME_LENGTH"))).delete({timeout: 10000}).catch();
        return false;
    }

    const date = getAdjustedDate(hh, mm);

    const teamoWaiting = new TeamoCommandWaiting(maxPlayers, date, game, args.author, client);
    if (args.channel.type === 'dm')
        args.channel.send(`${getLanguageResource('NEW_MESSAGE_CREATED_DM')} ${teamoChannel}`)
    await teamoWaiting.sendNewMessage(teamoChannel as Discord.TextChannel);
    return true;
}

// Handle commands
async function handleCommand(msg: Discord.Message | Discord.PartialMessage) {
    // Remove mention substring from command, and redundant whitespaces
    let argsWithoutClient = msg.content.replace(new RegExp(`<@!${msg.client.user.id}>`, 'g'),'');
    const args = argsWithoutClient.replace(/\s\s+/g, ' ').trim();
    console.log(`Handling new command with args \"${args}\"`);

    if (msg.channel.id !== config.channelID && msg.channel.type !== 'dm')
    {
        let wrongChannelMsg = await msg.channel.send(`Teamo ${getLanguageResource("WRONG_CHANNEL")} ${client.channels.get(config.channelID)}`);
        wrongChannelMsg.delete({timeout: 10000}).catch();
    }
    else if (args.toLowerCase().includes("help")) {
        await handleHelpCommand(msg.channel);
    }
    else if (args.toLowerCase() === "welcome") {
        await handleWelcomeCommand(msg.channel as Discord.TextChannel);
    }
    else if (args.toLowerCase() === "purge") {
        if (msg.channel.id === config.channelID) {
            await handlePurgeCommand(msg.channel as Discord.TextChannel);
            return;
        } else {
            let wrongChannelMsg = await msg.channel.send(`purge ${getLanguageResource("WRONG_CHANNEL")} ${client.channels.get(config.channelID)}`);
            wrongChannelMsg.delete({timeout: 10000}).catch();
        }
    }
    else {
        const mainCommandArgs = {
            args: args,
            channel: msg.channel as Discord.TextChannel,
            author: msg.author,
            updateInterval: config.updateInterval
        }
        await handleMainCommand(mainCommandArgs);
    }
    if (msg.channel.type !== 'dm')
        msg.delete({timeout: 10000}).catch();
}

client.login(config.token);
