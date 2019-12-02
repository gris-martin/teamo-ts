type Config = {
    token: string,
    prefix: string,
    language: "swedish" | "english",
    updateInterval: number
}

export const config: Config = {
    "token": `${process.env.BOT_TOKEN}`,
    "prefix": "!",
    "language": "swedish",
    "updateInterval": 15
}
