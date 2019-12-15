import * as Discord from 'discord.js';
import { handleWelcomeCommand } from './WelcomeCommand';

export async function handlePurgeCommand(channel: Discord.TextChannel) {
    const messages = await channel.messages.fetch();

    const welcomeMessage = messages.last();
    if (welcomeMessage.author.id === channel.client.user.id) {
        messages.delete(messages.lastKey());
    }
    await channel.bulkDelete(messages);
}
