type Config = {
    token: string,
    language: "swedish" | "english",
    updateInterval: number,
    channelID: string
}

export const config: Config = {
    "token": process.env.TEAMO_BOT_TOKEN,
    "language": "swedish",
    "updateInterval": 15,
    "channelID": process.env.TEAMO_CHANNEL_ID || "-1"
}
