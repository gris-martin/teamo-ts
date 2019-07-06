import * as Discord from 'discord.js';
import getLanguageResource from './LanguageResource';

const secToMs = 1000;
const minToMs = secToMs * 60;
const hourToMs = minToMs * 60;
const dayToMs = hourToMs * 24;

export class TeamArgs {
    game: string;
    maxPlayers: number;
    date: Date;

    constructor(args: string[]) {
        this.maxPlayers = parseInt(args[0]);
        this.game = ""
        for (const gameArg of args.slice(2)) {
            this.game += (gameArg + " ");
        }
        this.game = this.game.trim();
        // this.game = args[2];

        const hhmm = args[1].split(":");
        this.date = new Date();
        this.date.setHours(parseInt(hhmm[0]));
        this.date.setMinutes(parseInt(hhmm[1]));
        this.date.setSeconds(0);
    }

    getStartTimeString(displayDay: boolean = false) {
        let timeString = TeamArgs.getTimeString(this.date);
        if (displayDay)
            timeString += this.isTomorrow() ? " tomorrow" : " today";
        return timeString
    }

    static getCurrentTimeString() {
        return TeamArgs.getTimeString(new Date());
    }

    static getTimeString(date: Date) {
        let timeArray = date.toTimeString().split(" ")[0].split(":");
        return `${timeArray[0]}:${timeArray[1]}`;
    }

    getWaitTimeMs() {
        let waitTime = this.date.valueOf() - Date.now();
        if (waitTime < 0)
        {
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

    getMessage = () => {
        let msg = new Discord.RichEmbed()
            .setTitle(`${getLanguageResource("LOOKING_TIME_FOR")} **${this.game}**!!`)
            .setDescription(`**Start: ${this.getStartTimeString()}** - ${getLanguageResource("LOOKING_REGISTER")}`)
            .setColor("PURPLE")
            .addField(getLanguageResource("LOOKING_TIME_LEFT"), this.getWaitTimeString())
            .addField(getLanguageResource("LOOKING_TEAM_SIZE"), this.maxPlayers)
            .setFooter(`${getLanguageResource("LOOKING_UPDATE")}: ${TeamArgs.getCurrentTimeString()}`);
        return msg;
    }
}