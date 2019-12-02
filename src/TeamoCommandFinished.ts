import * as Discord from 'discord.js';
import { extractMembers, createTeams } from './TeamoCommandUtils';
import { getTimeString } from './TimeUtils';
import getLanguageResource from './LanguageResource';
import { Team } from './Team';


export class TeamoCommandFinished {
    teams: Array<Team>;
    game: string;
    date: Date;

    constructor(results: Discord.Collection<string, Discord.MessageReaction>, client: Discord.Client, maxPlayers: number, game: string, date: Date) {
        const members = extractMembers(results, client);
        this.teams = createTeams(members, maxPlayers);
        this.game = game;
        this.date = date;
    }

    sendMessage(channel: Discord.TextChannel)
    {
        // Write message with teams to the channel
        let resultEmbed = new Discord.MessageEmbed()
            .setTitle(`**${this.game} @ ${getTimeString(this.date, false, true)}**`)
            .setColor("PURPLE")
            .setFooter(getLanguageResource("RESULT_REMOVE_MESSAGE"));
        for (let i = 0; i < this.teams.length; i++) {
            const team = this.teams[i];
            resultEmbed = resultEmbed.addField(`${team.name} (${team.getNumPlayers()} ${getLanguageResource("PLAYERS")})`, team.getMembersString());
        }

        channel.send(resultEmbed)
            .then(foundMsg => (foundMsg as Discord.Message).delete({ timeout: 15 * 60 * 10000 }))
            .catch(console.error);
    }
}