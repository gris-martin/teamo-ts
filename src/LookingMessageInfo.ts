import * as Discord from 'discord.js';
import getLanguageResource from './LanguageResource';
import { Member } from './Member';

const secToMs = 1000;
const minToMs = secToMs * 60;
const hourToMs = minToMs * 60;
const dayToMs = hourToMs * 24;

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
        this.date = LookingMessageInfo.getAdjustedDate(hh, mm);
        this.members = new Array<Member>();
        this.isDeleting = false;
        this.deletionDate = null;
        this.creator = creator;
    }

    static getAdjustedDate(hh: number, mm: number): Date {
        let currentDate = new Date();
        let playDate = new Date();
        playDate.setHours(hh);
        playDate.setMinutes(mm);
        playDate.setSeconds(0);
        if (playDate.getTime() < currentDate.getTime())
            playDate.setTime(playDate.getTime() + dayToMs);
        return playDate;
    }

    getStartTimeString(displayDay: boolean = false) {
        let timeString = LookingMessageInfo.getTimeString(this.date);
        if (displayDay)
            timeString += this.isTomorrow() ? " tomorrow" : " today";
        return timeString
    }

    static getCurrentTimeString(showSeconds: boolean = false) {
        return LookingMessageInfo.getTimeString(new Date(), showSeconds);
    }

    static getTimeString(date: Date, showSeconds: boolean = false) {
        const timeArray = date.toTimeString().split(" ")[0].split(":");
        let timeString = `${timeArray[0]}:${timeArray[1]}`
        if (showSeconds) timeString += `:${timeArray[2]}`;
        return timeString;
    }

    getWaitTimeMs() {
        let waitTime = this.date.valueOf() - Date.now();
        if (waitTime < 0) {
            waitTime += dayToMs;
        }
        return waitTime;
    }

    getWaitTimeH = () => this.getWaitTimeMs() / (hourToMs);

    getWaitTimeMin = () => Math.floor((this.getWaitTimeH() - Math.floor(this.getWaitTimeH())) * 60);

    // Return string of the form '[hh] h [mm] min'
    getWaitTimeString = () => `${Math.floor(this.getWaitTimeH())} h ${Math.floor(this.getWaitTimeMin())} min`;

    // Return true if the event is tomorrow
    isTomorrow = () => (this.getWaitTimeMs() - dayToMs) < 0;

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
            .setDescription(`**Start: ${this.getStartTimeString()}** - ${getLanguageResource("LOOKING_REGISTER")}`)
            .setColor("PURPLE")
            .addField(getLanguageResource("LOOKING_TIME_LEFT"), this.getWaitTimeString())
            .addField(getLanguageResource("LOOKING_TEAM_SIZE"), this.maxPlayers)
            .addField(getLanguageResource("LOOKING_REGISTERED"), this.getMemberString())
            .setFooter(`${getLanguageResource("LOOKING_FOOTER")}: ${LookingMessageInfo.getCurrentTimeString(true)}`);

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