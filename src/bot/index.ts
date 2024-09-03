// Dependencies
import { Client, GatewayIntentBits, HeimdallDB } from '../mod.ts';
import config from '../config.ts';
import registerCommands from './register_slash_commands.ts';

// Types & Interfaces
import { HeimdallClient } from './ts/interfaces/Heimdall.ts';
import { Command } from './ts/interfaces/Command.ts';

// Variables
const DiscordClient: HeimdallClient = new Client({ intents: [GatewayIntentBits.Guilds] });

// Client Ready event
DiscordClient.on("ready", async () => {
    const commands = await registerCommands();

    DiscordClient.registeredCommands = commands ?? [];
    DiscordClient.database = new HeimdallDB();

    console.log(`🛡️ Heimdall> Client logged in as ${DiscordClient?.user?.tag} with a total of ${DiscordClient.registeredCommands.length} commands. 🗣️`);
});

// Client Interactions event
DiscordClient.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!DiscordClient.database?.getGuild(interaction.guildId!)) await DiscordClient.database?.addGuild(interaction.guildId!);

    const command: Command | undefined = DiscordClient.registeredCommands?.filter(command => command.name === interaction.commandName)[0];
    if (!command) return;
    return command.callback(DiscordClient, interaction);
});

// Login & Export
DiscordClient.login(config.DISCORD_TOKEN);
export default DiscordClient;