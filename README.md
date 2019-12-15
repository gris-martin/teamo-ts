# teamo
Teamo is a Discord bot for helping putting teams together when gaming. It can be useful if you're often more than the maximum number of players per team for the game you want to play.

## Setup
The project uses mainly Node.js and TypeScript. 
1. Download and install [Node.js](https://nodejs.org/en/). I have used version 12.3.1, but other versions should be fine as well.
2. Run `npm install` in the root directory. It will install all dependencies, including TypeScript.
3. Set the `BOT_TOKEN` environment variable to the token of your Discord bot (created using the [Discord Developer Portal](https://discordapp.com/developers/applications/)).
4. (Optional) Change settings in the `config.ts` file, e.g. prefix or language.

- To transpile the TypeScript code into standard Javascript, run
  ```
  npm build
  ```

- To launch the application, run
  ```
  npm start
  ```
