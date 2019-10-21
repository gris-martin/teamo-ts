import * as Discord from 'discord.js';
import { config } from './config';
import { Member } from './Member';
import { Team, TeamArray } from './Team';
import { TeamArgs } from './TeamArgs';
import { generateName } from './NameGenerator';
import getLanguageResource from './LanguageResource';

const client = new Discord.Client();

client.on('ready', () => {
    console.log("Bot online!");
});

client.on('message', msg => {
    if (msg.author.bot)
        return;

    if (!msg.content.startsWith(config.prefix))
        return;

    handleCommand(msg);
});

let numberEmojis = [
    '1⃣',
    '2⃣',
    '3⃣',
    '4⃣',
    '5⃣',
    '6⃣',
    '7⃣',
    '8⃣',
    '9⃣'
]

let cancelEmoji: string = "❌";


// Extract Members from a list of MessageReactions.
// Inputs
//      reactions: Collection of Discord.MessageReactions (as you get from Discord.Message.awaitReactions)
// Returns:
//      Array of Members, sorted so that the Member with the highest number of players is first
function extractMembers(reactions: Discord.Collection<string, Discord.MessageReaction>): Array<Member> {
    let members = new Array<Member>();

    reactions.forEach(reaction => {
        let i = numberEmojis.indexOf(reaction.emoji.name);
        if (i < 0) return;
        i++; // Array indexing starts at 0, but lowest number emoji is 1
        reaction.users.forEach(user => {
            if (user !== client.user) {
                members.push(new Member(user, i));
            }
        });
    });
    members.sort((a, b) => b.nPlayers - a.nPlayers);
    return members;
}


// Create a filter to be used with the Discord.Message.awaitReactions method.
// Inputs:
//      maxPlayers: The maximum number of players allowed in a team
// Result:
//      A function that checks whether a reaction is allowed of not.
//      Allowed reactions are the ones listed in numberEmojis.
//      Currently the function only allows a single emoji from each user, but this might change.
let createFilter = (maxPlayers: number) => {
    let filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        if (user.id === client.user.id)
            return false;

        // If the user has already reacted with an emoji, remove the old one
        let allowedEmojis = numberEmojis.slice(0, maxPlayers);
        allowedEmojis.push(cancelEmoji);
        if (allowedEmojis.includes(reaction.emoji.name)) {
            // let oldReactions = reaction.message.reactions.filter(
            //     r => (r.users.has(user.id) && r !== reaction)
            // );
            // oldReactions.forEach(r => { r.remove(user); });
            return true;
        }

        // If the user reacted with a non-allowed emoji, remove it
        reaction.remove(user);
        return false;
    }
    return filter;
}

// Create teams from an array of members
// Inputs:
//      members: Array of Members
//      maxPlayers: Maximum number of players per team
// Result:
//      An array of teams (TeamArray), where the number of players per team is divided as
//      evenly as possible
function createTeams(members: Member[], maxPlayers: number) {
    let nMembers = members.length;

    // Create initial teams from Members with more than half the number of maxPlayers
    // teams: Array of all the teams. This array will be expanded later if needed
    let teams = new TeamArray();
    members.forEach(member => {
        if (member.nPlayers > Math.floor(maxPlayers / 2.0)) {
            let team = new Team(member);
            teams.push(team);
            members.splice(members.indexOf(member), 1);
        }
    });

    // Bin packing problem
    // 1. Try to place all remaining members in one of the teams already created
    //      1.1 Add the highest member to the team with lowest number of members
    // 2. If there are not enough teams, create a new team with the user with the highest number of members
    // 3. Repeat 1-2 until n members left
    while (true) {
        let tmpTeams = TeamArray.copy(teams);
        for (const member of members) {
            tmpTeams.sort((a, b) => a.getNumPlayers() - b.getNumPlayers());  // Sort the teams to make the smallest team be filled first
            for (let team of tmpTeams) {
                if (team.getNumPlayers() + member.nPlayers > maxPlayers) {
                    continue;
                }
                else {
                    team.members.push(member);
                    break;
                }
            }
        }
        if (tmpTeams.getNumMembers() === nMembers) {
            teams = tmpTeams;
            break;
        }
        else {
            let newTeamMember = members.splice(0, 1)[0];
            let newTeam = new Team(newTeamMember);
            teams.push(newTeam);
        }
    }

    return teams;
}

// Handle commands
async function handleCommand(msg: Discord.Message) {
    const command = msg.content.split(" ")[0].replace(config.prefix, "");
    const args = msg.content.substr(msg.content.indexOf(' ') + 1);
    let commandHandled = false;

    // !help
    if (command === "help") {
        let helpEmbed = new Discord.RichEmbed()
            .setColor("PURPLE")
            .setTitle(`**${getLanguageResource("HELP_TITLE")}**`)
            .setDescription("\n[GitHub](https://github.com/hassanbot/teamo)\n\n" + getLanguageResource("HELP_DESCRIPTION"))
            .addField(getLanguageResource("HELP_FORMAT_TITLE"), getLanguageResource("HELP_FORMAT_FIELD"))
            .addField(getLanguageResource("HELP_EXAMPLE_TITLE"),
                "!play 5 20:00 League of Legends\n" +
                "!play 6 14:26 OW")
            .setFooter(getLanguageResource("HELP_FOOTER"));
        (await msg.channel.send(helpEmbed) as Discord.Message)
            .delete(60000);
        commandHandled = true;
    }

    // !createTeam
    if (command === "play") {
        // Validate arguments
        const argsArray = args.match(/(\d+)\s(\d{1,2})[:.]?(\d{2})\s(.+)/);
        if (argsArray === null) {
            (await msg.channel.send(getLanguageResource("ARGS_PLAY_INVALID_FORMAT")) as Discord.Message)
                .delete(10000);
            return;
        }
        const maxPlayers = parseInt(argsArray[1]);
        const hh = parseInt(argsArray[2]);
        const mm = parseInt(argsArray[3]);
        const game = argsArray[4];
        const teamArgs = new TeamArgs(maxPlayers, hh, mm, game);

        // Send the "looking for team" message and wait for reactions
        let lookingMsg = (await msg.channel.send(teamArgs.getMessage())) as Discord.Message;

        const filter = createFilter(teamArgs.maxPlayers);
        const collector = lookingMsg.createReactionCollector(filter, { time: teamArgs.getWaitTimeMs() });

        // Delete message if ❌ is pressed
        collector.on('collect', reaction => {
            if (reaction.emoji.name == cancelEmoji) {
                lookingMsg.delete();
            }
        });

        // Create teams when the collector times out
        collector.on('end', results => {
            const members = extractMembers(results);
            const teams = createTeams(members, teamArgs.maxPlayers);

            // Write message with teams to the channel
            let resultEmbed = new Discord.RichEmbed()
                .setTitle(`**${teamArgs.game} @ ${teamArgs.getStartTimeString()}**`)
                .setColor("PURPLE")
                .setFooter(getLanguageResource("RESULT_REMOVE_MESSAGE"));
            for (let i = 0; i < teams.length; i++) {
                const team = teams[i];
                resultEmbed = resultEmbed.addField(`${team.name} (${team.getNumPlayers()} ${getLanguageResource("PLAYERS")})`, team.getMembersString());
            }
            lookingMsg.channel.send(resultEmbed)
                .then(foundMsg => (foundMsg as Discord.Message).delete(15 * 60 * 10000))
                .catch(console.error);

            // Delete registration message after 10 seconds
            lookingMsg.delete(10000).catch(console.error);
        });

        // Update message every 15 seconds
        const intervalId = setInterval(updateMessage, 1000 * 15);
        function updateMessage() {
            lookingMsg.edit(teamArgs.getMessage(extractMembers(lookingMsg.reactions))).catch(err => {
                if (err instanceof Discord.DiscordAPIError)
                    clearInterval(intervalId);
                else
                    console.error(err);
            });
        }

        // Place reacts
        for (let i = 0; i < teamArgs.maxPlayers - 1; i++) {
            await lookingMsg.react(numberEmojis[i]);
        }
        await lookingMsg.react(cancelEmoji);
        commandHandled = true;
    }

    // !getName
    if (command === "getName") {
        msg.channel.send(generateName());
        commandHandled = true;
    }

    // Notify the user if the command was invalid
    if (commandHandled)
        msg.delete(5000).catch(console.error);
    else {
        let invalidMsg = await msg.channel.send(`Invalid command: "${command}"`) as Discord.Message;
        invalidMsg.delete(10000).catch(console.error);
        msg.delete(10000).catch(console.error);
    }
}

client.login(config.token);
