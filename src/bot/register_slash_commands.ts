// Dependencies
import { REST, Routes } from "discord.js";
import * as fs from "fs/promises";
import config from "../config.ts";

// Types & Interfaces
import { Command, RegisterableCommand } from "./ts/interfaces/Command.ts";

// Variables
const rest: REST = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

// Functions
/**
 * Get all commands from ./commands/ folder.
 * @returns An array of all the commands created for the bot.
 */
async function getCommands(): Promise<Array<Command>> {
    const commands: Array<Command> = [];

    for await (const file of await fs.readdir("./src/bot/commands")) {
        const command: Command = (await import(`./commands/${file}`)).default;
        commands.push(command);
    }

    return commands;
}

/**
 * Registers all the application commands for the bot.
 */
async function registerCommands(): Promise<Array<Command> | undefined> {
    try {
        const commands = await getCommands();

        console.log("🛡️ Heimdall> Started refreshing application (/) commands.");

        const registerableCommands: Array<RegisterableCommand> = commands.map(command => {
            const { callback, ...commandWithoutCallback } = command;
            return commandWithoutCallback;
        });

        await rest.put(Routes.applicationCommands(config.DISCORD_CLIENTID), {
            body: registerableCommands,
        });

        console.log("🛡️ Heimdall> Successfully reloaded application (/) commands.");
        return commands;
    } catch(error) {
        console.error("🛡️ Heimdall> Unable registering commands", error);
    }
}

// Export
export default registerCommands;