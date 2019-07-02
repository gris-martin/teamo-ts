import * as Discord from 'discord.js';

export class Member {
    user: Discord.User;
    nPlayers: number;
    constructor(user: Discord.User, nPlayers: number) {
        this.user = user;
        this.nPlayers = nPlayers;
    }

    static copy(other: Member): Member {
        return new Member(other.user, other.nPlayers);
    }
}
