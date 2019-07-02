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
        this.game = args[2];

        const hhmm = args[1].split(":");
        this.date = new Date();
        this.date.setHours(parseInt(hhmm[0]));
        this.date.setMinutes(parseInt(hhmm[1]));
        this.date.setSeconds(0);
    }

    getStartTimeString() {
        let timeArray = this.date.toTimeString().split(" ")[0].split(":");
        return `${timeArray[0]}:${timeArray[1]}`;
    }
    // getStartTime = () => this.date.toTimeString().split(" ")[0];

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

    isTomorrow = () => this.getWaitTimeMs() - 60 * 60 * 24
}