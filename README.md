# teamo
Teamo is a Discord bot for helping putting teams together when gaming. It can be useful if you're often more than the maximum number of players per team for the game you want to play.

## Setup
The project uses mainly Node.js and TypeScript. 
1. Download and install [Node.js](https://nodejs.org/en/). I have used version 12.3.1, but other versions should be fine as well.
2. Run `npm install` in the root directory. It will install all dependencies, including TypeScript.
3. Set the `TEAMO_BOT_TOKEN` environment variable to the token of your Discord bot (created using the [Discord Developer Portal](https://discordapp.com/developers/applications/)).
4. Set the `TEAMO_CHANNEL_ID` environment variable to the channel ID of the channel where Teamo should be active. See [this](https://www.reddit.com/r/discordapp/comments/50thqr/finding_channel_id/) reddit question for info on getting the channel ID. 
5. (Optional) Change settings in the `config.ts` file, e.g. language or the refresh rate (updateInterval) of posted messages. Points 3 and 4 of this list can be omitted if they are configured directly in `config.ts` as well.

- To transpile the TypeScript code into standard Javascript, run
  ```
  npm build
  ```

- To launch the application, run
  ```
  npm start
  ```
