import * as Discord from 'discord.js';
import getLanguageResource from './LanguageResource';
import { Member } from './Member';
import { getCurrentTimeString, secToMs, getWaitTimeString, getTimeString, getWaitTimeMs } from './TimeUtils';
import { config } from './config';
import { getAllowedNumberEmojis, cancelEmoji, getNumPlayersFromReaction, removeOldReactions } from './TeamoCommandUtils';
import { TeamoCommandFinished } from './TeamoCommandFinished';

export class TeamoCommandWaiting {
    game: string;
    maxPlayers: number;
    finishDate: Date;
    members: Array<Member>;
    isDeleting: boolean;
    deletionDate: Date;
    creator: Discord.User;
    message: Discord.Message;
    client: Discord.Client;
    allowedNumberEmojis: Array<string>;

    collectors: Array<Discord.ReactionCollector>;
    updateTimeout: NodeJS.Timeout;
    deletionTimeout: NodeJS.Timeout;
    isDeleted: boolean;

    constructor(maxPlayers: number, date: Date, game: string, creator: Discord.User, client: Discord.Client) {
        this.maxPlayers = maxPlayers;
        this.game = game;
        this.finishDate = date;
        this.members = new Array<Member>();
        this.isDeleting = false;
        this.deletionDate = null;
        this.creator = creator;
        this.client = client;
        this.allowedNumberEmojis = getAllowedNumberEmojis(maxPlayers);
        this.deletionTimeout = null;
        this.collectors = new Array<Discord.ReactionCollector>();
        this.isDeleted = false;
    }

    static isAllowedNumberReaction(reaction: Discord.MessageReaction, caller: TeamoCommandWaiting): boolean {
        if (caller.allowedNumberEmojis.includes(reaction.emoji.name))
            return true;
        return false;
    }

    static isCancelReaction(reaction: Discord.MessageReaction, _caller: TeamoCommandWaiting): boolean {
        if (reaction.emoji.name === cancelEmoji)
            return true;
        return false;
    }

    static isDisallowedReaction(reaction: Discord.MessageReaction, caller: TeamoCommandWaiting): boolean {
        if (TeamoCommandWaiting.isAllowedNumberReaction(reaction, caller) || TeamoCommandWaiting.isCancelReaction(reaction, caller))
            return false;
        return true;
    }


    async sendNewMessage(channel: Discord.TextChannel) {
        if (this.message == null)
        {
            this.message = (await channel.send(this.getMessage())) as Discord.Message;
            for (const emoji of this.allowedNumberEmojis) {
                await this.message.react(emoji);
            }
            await this.message.react(cancelEmoji);
            this.addCallbacks();
            console.debug(`[${this.game}] New message sent`);
        }
        else
            console.trace("TeamoCommand cannot send new message since one already exists!");
    }

    updateMessage() {
        this.message.edit(this.getMessage()).catch(err => {
            console.error(err);
        });
    }

    createCollector(allowedFunc: (reaction: Discord.MessageReaction, caller: TeamoCommandWaiting) => boolean) {
        const collector = this.message.createReactionCollector(
            (reaction: Discord.MessageReaction, user: Discord.User) => {
                if (user.id === this.client.user.id)
                    return false;
                if (allowedFunc(reaction, this))
                    return true;
                return false;
            },
            {
                dispose: true,
                time: getWaitTimeMs(this.finishDate)
            }
        );
        this.collectors.push(collector);
        return collector;
    }

    addNumberReactionCallback() {
        const collector = this.createCollector(TeamoCommandWaiting.isAllowedNumberReaction);
        collector.on('collect', (reaction, user) => {
            removeOldReactions(reaction, user);
            this.changeOrCreateMember(reaction, user);
            this.updateMessage();
        });
        collector.on('remove', (reaction, user) => {
            const numPlayers = getNumPlayersFromReaction(reaction);
            this.removeMember(user, numPlayers);
            this.updateMessage();
        });
        collector.on('end', results => {
            if (!this.isDeleted)
            {
                let finished = new TeamoCommandFinished(results, this.client, this.maxPlayers, this.game, this.finishDate);
                finished.sendMessage(this.message.channel as Discord.TextChannel);
                this.deleteSelf();
            }
        })
    }

    addCancelReactionCallback() {
        const collector = this.createCollector(TeamoCommandWaiting.isCancelReaction);
        collector.on('collect', (reaction, user) => {
            if (user.id !== this.creator.id)
                reaction.users.remove(user);
            this.startDeleteTimer(15);
            this.updateMessage();
        });
        collector.on('remove', () => {
            this.stopDeleteTimer();
        })
    }

    addDisallowedReactionCallback() {
        const collector = this.createCollector(TeamoCommandWaiting.isDisallowedReaction);
        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user);
        });
    }

    addUpdateMessageCallback() {
        if (this.message == null || getWaitTimeMs(this.finishDate) < 0)
            return false;
        this.updateMessage();
        this.updateTimeout = setTimeout(() => this.addUpdateMessageCallback(), config.updateInterval * 1000);
    }

    addMessageDeletedCallback() {
        // TODO: This callback will never be deleted. Tried using a MessageCollector
        // but it only listened to messages deleted by the client.
        this.client.on('messageDelete', message => {
            if (message.id === this.message.id) {
                this.deleteSelf();
            }
        });
    }

    addCallbacks() {
        this.addNumberReactionCallback();
        this.addCancelReactionCallback();
        this.addDisallowedReactionCallback();
        this.addUpdateMessageCallback();
        this.addMessageDeletedCallback();
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
            .setDescription(`**Start: ${getTimeString(this.finishDate, false, true)}** - ${getLanguageResource("LOOKING_REGISTER")}`)
            .setColor("PURPLE")
            .addField(getLanguageResource("LOOKING_TIME_LEFT"), getWaitTimeString(this.finishDate))
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
        console.log(`[${this.game}] Starting delete timer. Deleting in ${secs} seconds`)
        this.deletionTimeout = setTimeout(
            () => this.deleteSelf(),
            secs * 1000
        );
    }

    stopDeleteTimer() {
        this.isDeleting = false;
        this.deletionDate = null;
        clearTimeout(this.deletionTimeout);
        this.updateMessage();
        console.log(`[${this.game}] Delete timer aborted`);
    }

    deleteSelf() {
        if (!this.isDeleted)
        {
            this.isDeleted = true;
            if (!this.message.deleted)
                this.message.delete();
            this.stopCollectors();
            clearTimeout(this.updateTimeout);
            console.log(`[${this.game}] Message deleted`);
        }
    }

    getTimeUntilDeletion() {
        let deletionTimeMs = this.deletionDate.getTime() - Date.now();
        return deletionTimeMs / secToMs;
    }

    // If the user has already reacted, replace their number of players with the new reaction
    // otherwise add a new Member attribute for the user
    changeOrCreateMember(reaction: Discord.MessageReaction, user: Discord.User) {
        let nPlayers = getNumPlayersFromReaction(reaction);
        let member = this.members.find(value => value.user.id === user.id);
        if (member === undefined)
        {
            console.log(`[${this.game}] New member added: ${user.username}. Players: ${nPlayers}`)
            this.members.push(new Member(user, nPlayers));
        }
        else
        {
            console.log(`[${this.game}] Member ${user.username} updated. Players: ${nPlayers}`);
            member.nPlayers = nPlayers;
        }
        return;
    }

    // Remove the member corresponding to the user
    removeMember(user: Discord.User, numPlayers: number) {
        const member = this.members.find(member => member.user == user);
        if (member.nPlayers === numPlayers)
        {
            console.log(`[${this.game}] Member ${user.username} removed.`);
            this.members.splice(this.members.findIndex(member => member.user == user), 1);
        }
    }

    stopCollectors() {
        this.collectors.forEach(collector => {
            if (!collector.ended)
                collector.stop();
        });
    }
}