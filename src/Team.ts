import * as Discord from 'discord.js';
import { Member } from './Member';
import { generateName } from './NameGenerator';

export class Team {
    members: Array<Member>;
    name: string;
    constructor(member: Member) {
        this.members = new Array<Member>();
        this.members.push(member);
        this.name = generateName();
    }

    //TODO: This is ugly, should not create a client here
    static copy(other: Team): Team {
        const client = new Discord.Client();
        let newTeam = new Team(new Member(client.user, 0));
        newTeam.members = new Array<Member>();
        for (const member of other.members) {
            newTeam.members.push(member);
        }
        return newTeam;
    }

    getNumPlayers() {
        let s = 0;
        for (const member of this.members) {
            s += member.nPlayers;
        }
        return s;
    }

    getNumMembers = () => this.members.length;

    getMembersString() {
        let memberString = "";
        for (const member of this.members) {
            memberString += `${member.user} (${member.nPlayers})\n`;
        }
        return memberString;
    }
}

export class TeamArray extends Array<Team> {
    static copy(other: TeamArray) {
        let newTeam = new TeamArray();
        for (const team of other) {
            newTeam.push(Team.copy(team));
        }
        return newTeam;
    }

    getNumMembers() {
        let nMembers = 0;
        for (const team of this) {
            nMembers += team.getNumMembers();
        }
        return nMembers;
    }
}

