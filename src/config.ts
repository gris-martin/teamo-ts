type Config = {
    token: string,
    prefix: string,
    language: "swedish" | "english",
    updateInterval: number,
    useSpecificChannel: boolean,
    channelID: string
}

export const config: Config = {
    "token": process.env.TEAMO_BOT_TOKEN,
    "prefix": "!",
    "language": "swedish",
    "updateInterval": 15,
    "useSpecificChannel": true,
    "channelID": process.env.TEAMO_CHANNEL_ID || "-1"
}
