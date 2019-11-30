type Config = {
    token: string,
    prefix: string,
    language: "swedish" | "english";
}

export const config: Config = {
    "token": `${process.env.BOT_TOKEN}`,
    "prefix": "!",
    "language": "swedish"
}
