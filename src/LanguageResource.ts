import { config } from './config';

type LanguageEntry = {
        swedish: string;
        english: string;
}

type LanguageDict = {
    [key:string]: LanguageEntry;
}

const LanguageObject: LanguageDict = {
    "HELP_TITLE": {
        "swedish": "Användning",
        "english": "Usage"
    },
    "HELP_DESCRIPTION": {
        "swedish": "!play <antal spelare per lag> <starttid (hh:mm)> <spel>",
        "english": "!play <number of players per team> <time to start (hh:mm)> <game>"
    },
    "HELP_EXAMPLE_TITLE": {
        "swedish": "Exempel",
        "english": "Example"
    },
    "HELP_FOOTER": {
        "swedish": "Detta meddelande kommer tas bort efter 20 sekunder.",
        "english": "This message will be deleted after 20 seconds"
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
    "LOOKING_UPDATE": {
        "swedish": "Uppdateras var 15:e sekund. Senast uppdaterad",
        "english": "Updated every 15th second. Last update"
    },
    "ARGS_PLAY_INVALID_FORMAT": {
        "swedish": "Fel format på kommandot. Rätt format: \"!play <spelare> <hh>:<mm> <spel>\". Skriv **!help** för mer info.",
        "english": "Invalid format. The command should be on the form: \"!play <players> <hh>:<mm> <game>\". Type **!help** for more info."
    }

}

export default function getLanguageResource(desc: string) {
    if (desc in LanguageObject)
        return LanguageObject[desc][config.language];
    else
        throw Error("Invalid language description");
}
