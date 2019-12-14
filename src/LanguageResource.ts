import { config } from './config';

type LanguageEntry = {
    swedish: string;
    english: string;
}

type LanguageDict = {
    [key: string]: LanguageEntry;
}

const LanguageObject: LanguageDict = {
    "HELP_TITLE": {
        "swedish": "Teamo - användning",
        "english": "Teamo - usage"
    },
    "HELP_DESCRIPTION": {
        "swedish": "Använd Teamo för att kolla om folk vill spela, och skapa lag vid en viss tidpunkt. Det går att anmäla sig själv och andra till spelet genom att klicka på motsvarande emote (vill man t.ex. anmäla att man själv och en kompis vill spela klickar man på 2⃣). När tidpunkten nås kommer botten informera om hur många lag som skapas och vilka som ska spela i vilket lag.",
        "english": "Use Teamo to check if people want to play, and to make teams at a given time. Use the emotes of the created message to register yourself and others (for example, if you and a friend wants to play, press 2⃣). When the time specified in the original message is reached, the bot will create a new message with information on the number of teams, and the team composition."
    },
    "HELP_FORMAT_TITLE": {
        "swedish": "Format",
        "english": "Format"
    },
    "HELP_FORMAT_FIELD": {
        "swedish": "<antal spelare per lag> <starttid (hh:mm)> <spel>",
        "english": "<number of players per team> <time to start (hh:mm)> <game>"
    },
    "HELP_EXAMPLE_TITLE": {
        "swedish": "Exempel",
        "english": "Example"
    },
    "HELP_FOOTER": {
        "swedish": "Detta meddelande kommer tas bort efter 60 sekunder.",
        "english": "This message will be deleted after 60 seconds"
    },
    "RESULT_REMOVE_MESSAGE": {
        "swedish": "Det här meddelandet kommer tas bort om 15 minuter.",
        "english": "This message will be deleted after 15 minutes."
    },
    "PLAYERS": {
        "swedish": "spelare",
        "english": "players"
    },
    "LOOKING_TIME_FOR": {
        "english": "Time for",
        "swedish": "Dags för"
    },
    "LOOKING_REGISTER": {
        "swedish": "För anmälan, tryck emotes nedan med antal som vill spela.",
        "english": "To register, press emotes below corresponding to the number of people who wants to play."
    },
    "LOOKING_TIME_LEFT": {
        "swedish": "Tid kvar",
        "english": "Time left"
    },
    "LOOKING_TEAM_SIZE": {
        "swedish": "Spelare per lag",
        "english": "Players per team"
    },
    "LOOKING_REGISTERED": {
        "swedish": "Anmälda",
        "english": "Registered"
    },
    "LOOKING_NO_REGISTERED": {
        "swedish": "Inga anmälda än",
        "english": "No one has registered yet"
    },
    "LOOKING_FOOTER": {
        "swedish": "Uppdateras var 15:e sekund. Senast uppdaterad",
        "english": "Updated every 15th second. Last update"
    },
    "ARGS_PLAY_INVALID_FORMAT_1": {
        "swedish": "Fel format på kommandot. Rätt format: \"<spelare> <hh>:<mm> <spel>\". Se",
        "english": "Invalid format. The command should be on the form: \"<players> <hh>:<mm> <game>\". See"
    },
    "ARGS_PLAY_INVALID_FORMAT_2": {
        "swedish": "för mer info.",
        "english": "for more info."
    },
    "DELETION_TITLE": {
        "swedish": "MEDDELANDET TAS BORT",
        "english": "MESSAGE WILL BE REMOVED"
    },
    "DELETION_TIMER_1": {
        "swedish": "MEDDELANDET KOMMER TAS BORT OM",
        "english": "MESSAGE WILL BE REMOVED IN"
    },
    "DELETION_TIMER_2": {
        "swedish": "SEKUNDER. TRYCK PÅ ❌ IGEN FÖR ATT AVBRYTA.",
        "english": "SECONDS. PRESS ❌ AGAIN TO ABORT."
    },
    "TODAY": {
        "swedish": "idag",
        "english": "today"
    },
    "TOMORROW": {
        "swedish": "imorgon",
        "english": "tomorrow"
    },
    "WRONG_CHANNEL": {
        "swedish": "Teamo kan bara användas från",
        "english": "Teamo can only be used from"
    },
    "NEW_MESSAGE_CREATED_DM": {
        "swedish": "Meddelande skapat i",
        "english": "Message created in"
    },
    "IN_PRIVATE_MESSAGE": {
        "swedish": "i privat meddelande",
        "english": "in direct message"
    }
}

export default function getLanguageResource(desc: string) {
    if (desc in LanguageObject)
        return LanguageObject[desc][config.language];
    else
        return "INVALID LOCALIZATION STRING";
}
