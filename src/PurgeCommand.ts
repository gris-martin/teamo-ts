import * as Discord from 'discord.js';
import { handleWelcomeCommand } from './WelcomeCommand';

export async function handlePurgeCommand(channel: Discord.TextChannel) {
    const messages = await channel.messages.fetch();
    // channel.awaitMessages(() => true, {time: 1}).then(collected => console.log("Collected", collected));

    const welcomeMessage = messages.last();
    console.log(welcomeMessage);
    if (welcomeMessage.author.id === channel.client.user.id) {
        messages.delete(messages.lastKey());
    }
    await channel.bulkDelete(messages);
}
