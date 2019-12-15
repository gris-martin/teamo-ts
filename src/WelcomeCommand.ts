import * as Discord from 'discord.js';
import { getHelpMessage } from './HelpCommand';
import getLanguageResource from './LanguageResource';

export async function handleWelcomeCommand(channel: Discord.TextChannel) {
    let welcomeEmbed = getHelpMessage(channel.client.user);
    welcomeEmbed.setFooter(getLanguageResource("HELP_FOOTER"));
    await channel.send(welcomeEmbed);
}