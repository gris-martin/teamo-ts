import * as Discord from 'discord.js';
import { config } from './config';
import { Member } from './Member';
import { Team, TeamArray } from './Team';
import { TeamArgs } from './TeamArgs';
import { generateName } from './NameGenerator';

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
        // If the user has already reacted with an emoji, remove the old one
        let allowedEmojis = numberEmojis.slice(0, maxPlayers);
        if (allowedEmojis.includes(reaction.emoji.name)) {
            let oldReactions = reaction.message.reactions.filter(
                r => (r.users.has(user.id) && r !== reaction)
            );
            // oldReactions.forEach(r => { r.remove(user); });
            return true;
        }

        // If the user reacted with a non-allowed emoji, remove it
        reaction.remove(user);
        return false;
    }
    return filter;
}

// Wait for, and then count, the reactions of a message
async function handleReactions(msg: Discord.Message, teamArgs: TeamArgs) {

    // Await the timeout
    const results = await msg.awaitReactions(createFilter(teamArgs.maxPlayers), { time: teamArgs.getWaitTimeMs() }).catch(console.error);
    if (results === undefined)
        return;

    let members = extractMembers(results);
    let nMembers =  members.length;

    // Create initial teams from Members with more than half the number of maxPlayers
    // teams: Array of all the teams. This array will be expanded later if needed
    let teams = new TeamArray();
    members.forEach(member => {
        if (member.nPlayers > Math.floor(teamArgs.maxPlayers / 2.0)) {
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
                if (team.getNumPlayers() + member.nPlayers > teamArgs.maxPlayers) {
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


    // Write number of teams to the channel
    let resultEmbed = new Discord.RichEmbed()
        .setTitle(`**${teamArgs.game} @ ${teamArgs.getStartTimeString()}**`)
        .setColor("PURPLE")
        .setDescription("This message will be deleted after 15 minutes.");

    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        resultEmbed = resultEmbed.addField(`${team.name} (${team.getNumPlayers()} players)`, team.getMembersString());
    }

    (await msg.channel.send(resultEmbed) as Discord.Message).delete(15 * 60 * 10000);
    return new Promise((resolve, _reject) => {
        resolve();
    })
}

// Handle commands
async function handleCommand(msg: Discord.Message) {
    let command = msg.content.split(" ")[0].replace(config.prefix, "");
    let args = msg.content.split(" ").slice(1);

    // !help
    if (command === "help") {
        let helpEmbed = new Discord.RichEmbed()
            .setTitle("**Usage**")
            .setDescription("!play <number of players> <time to start (hh:mm)> <game>")
            .addField("Examples", "!play 5 20:00 League of Legends\n" +
                                  "!play 6 14:26 OW")
            .setColor("PURPLE");
        (await msg.channel.send(helpEmbed) as Discord.Message).delete(20000);
        msg.delete();
    }

    // !createTeam
    if (command === "play") {
        const teamArgs = new TeamArgs(args);
        let teamMsg = (await msg.channel.send(teamArgs.getMessage())) as Discord.Message;

        handleReactions(teamMsg, teamArgs).then(() => teamMsg.delete(10000)).catch(console.error);

        for (let i = 0; i < teamArgs.maxPlayers - 1; i++) {
            await teamMsg.react(numberEmojis[i]);
        }
        msg.delete();
    }

    // !getName
    if (command === "getName") {
        msg.channel.send(generateName());
        msg.delete();
    }
}

client.login(config.token);
