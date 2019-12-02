import * as Discord from 'discord.js';
import { Member } from './Member';
import { TeamArray, Team } from './Team';

export const numberEmojis = [
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

export const cancelEmoji: string = "❌";


// Returns the emojis that shouldn't be ignored.
// Those emojis are all the numbers less than max players, and the cancel emoji
export const getAllowedNumberEmojis = (maxPlayers: number) => {
    let allowedEmojis = new Array<string>();
    if (maxPlayers > numberEmojis.length + 1)
    {
        console.warn(`Can't register more than ${numberEmojis.length+1} team members per player. Input was ${maxPlayers}`);
        allowedEmojis.push(...numberEmojis);
    }
    else
    {
        allowedEmojis.push(...numberEmojis.slice(0, maxPlayers-1));
    }
    return allowedEmojis;
}


// Create a filter to be used with the Discord.Message.awaitReactions method.
// Inputs:
//      maxPlayers: The maximum number of players allowed in a team
//      client: The Discord bot, whose reactions shouldn't be counted
// Result:
//      A function that checks whether a reaction is allowed of not.
//      Currently the function only allows a single emoji from each user, but this might change.
export function createNumberFilter(maxPlayers: number, client: Discord.Client) {
    let filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        if (user.id === client.user.id)
            return false;

        let allowedEmojis = getAllowedNumberEmojis(maxPlayers);        
        if (allowedEmojis.includes(reaction.emoji.name))
            return true;

        // If the user reacted with a non-allowed emoji, remove it
        return false;
    }
    return filter;
}


// Returns true if the input reaction is the cancel emoji
export function createCancelFilter(client: Discord.Client) {
    let filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
        if (user.id === client.user.id)
            return false;

        if (reaction.emoji.name === cancelEmoji)
            return true;

        reaction.users.remove(user);
        return false;
    }
    return filter;
}


export function removeOldReactions(reaction: Discord.MessageReaction, user: Discord.User) {
    // If the user has already reacted with an emoji, remove the old one
    let oldReactions = reaction.message.reactions.filter(
        r => (r.users.has(user.id) && r !== reaction)
    );
    oldReactions.forEach(r => {
        r.users.remove(user);
    });
}


// Array indexing starts at 0, but lowest number emoji is 1
export function getNumPlayersFromReaction(reaction: Discord.MessageReaction): number {
    return numberEmojis.indexOf(reaction.emoji.name) + 1;
}


// Extract Members from a list of MessageReactions.
// Inputs
//      reactions: Collection of Discord.MessageReactions (as you get from Discord.Message.awaitReactions)
// Returns:
//      Array of Members, sorted so that the Member with the highest number of players is first
export function extractMembers(reactions: Discord.Collection<string, Discord.MessageReaction>, client: Discord.Client): Array<Member> {
    let members = new Array<Member>();

    reactions.forEach(reaction => {
        let i = getNumPlayersFromReaction(reaction);
        if (i < 1) return;
        reaction.users.forEach(user => {
            if (user !== client.user) {
                members.push(new Member(user, i));
            }
        });
    });
    members.sort((a, b) => b.nPlayers - a.nPlayers);
    return members;
}


// Create teams from an array of members
// Inputs:
//      members: Array of Members
//      maxPlayers: Maximum number of players per team
// Result:
//      An array of teams (TeamArray), where the number of players per team is divided as
//      evenly as possible
export function createTeams(members: Member[], maxPlayers: number) {
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
