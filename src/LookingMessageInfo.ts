import * as Discord from 'discord.js';
import getLanguageResource from './LanguageResource';
import { Member } from './Member';
import { getCurrentTimeString, getAdjustedDate, secToMs, getWaitTimeString, getTimeString } from './TimeUtils';

export class LookingMessageInfo {
    game: string;
    maxPlayers: number;
    date: Date;
    members: Array<Member>;
    isDeleting: boolean;
    deletionDate: Date;
    creator: Discord.User;

    constructor(maxPlayers: number, hh: number, mm: number, game: string, creator: Discord.User) {
        this.maxPlayers = maxPlayers;
        this.game = game;
        // Create date
        this.date = getAdjustedDate(hh, mm);
        this.members = new Array<Member>();
        this.isDeleting = false;
        this.deletionDate = null;
        this.creator = creator;
    }

    getMemberString = () => {
        let memberString = ""
        if (this.members.length === 0)
            return getLanguageResource("LOOKING_NO_REGISTERED");
        for (const member of this.members) {
            memberString += `${member.user.username} (**${member.nPlayers}**), `
        }
        return memberString.substring(0, memberString.length - 2);
    }

    getMessage = () => {
        let msg = new Discord.MessageEmbed()
            .setTitle(`${getLanguageResource("LOOKING_TIME_FOR")} **${this.game}**!!`)
            .setDescription(`**Start: ${getTimeString(this.date, false, true)}** - ${getLanguageResource("LOOKING_REGISTER")}`)
            .setColor("PURPLE")
            .addField(getLanguageResource("LOOKING_TIME_LEFT"), getWaitTimeString(this.date))
            .addField(getLanguageResource("LOOKING_TEAM_SIZE"), this.maxPlayers)
            .addField(getLanguageResource("LOOKING_REGISTERED"), this.getMemberString())
            .setFooter(`${getLanguageResource("LOOKING_FOOTER")}: ${getCurrentTimeString(true)}`);

        if (this.isDeleting) {
            let delTitle = getLanguageResource("DELETION_TITLE");
            let delMsg1 = getLanguageResource("DELETION_TIMER_1");
            let delTime = Math.round(this.getTimeUntilDeletion());
            let delMsg2 = getLanguageResource("DELETION_TIMER_2");
            msg.addField(delTitle, `${delMsg1} ${delTime} ${delMsg2}`);
        }

        return msg;
    }

    startDeleteTimer(secs: number) {
        this.isDeleting = true;
        this.deletionDate = new Date(Date.now() + secs * secToMs);
    }

    stopDeleteTimer() {
        this.isDeleting = false;
        this.deletionDate = null;
    }

    getTimeUntilDeletion() {
        let deletionTimeMs = this.deletionDate.getTime() - Date.now();
        return deletionTimeMs / secToMs;
    }

    changeOrCreateMember(user: Discord.User, nPlayers: number) {
        let member = this.members.find(value => value.user.id === user.id);
        if (member === undefined)
            this.members.push(new Member(user, nPlayers));
        else
            member.nPlayers = nPlayers;
        return;
    }
}