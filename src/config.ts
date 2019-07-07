type Config = {
    token: string,
    prefix: string,
    commands: string[],
    language: "swedish" | "english";
}

export const config: Config = {
    "token": `${process.env.BOT_TOKEN}`,
    "prefix": "!",
    "commands": [
        "help",
        "play",
        "getName"
    ],
    "language": "swedish"
}
