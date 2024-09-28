// Dependencies
import { Client, GatewayIntentBits, HeimdallDB } from '../mod.ts';
import config from '../config.ts';
import registerCommands from './register_slash_commands.ts';

// Types & Interfaces
import { HeimdallClient } from './ts/interfaces/Heimdall.ts';
import { Command } from './ts/interfaces/Command.ts';
import { HeimdallServerConfig } from '../database/ts/types/DataTypes.ts';
import { Message } from 'discord.js';

// Checks
import phishingLinksCheck from './checks/phishing_links.ts';
import spamCheck from './checks/spam.ts';

// Variables
const DiscordClient: HeimdallClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


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

    const guildID = interaction.guildId!;
    if (!guildID) {
        interaction.reply({
            ephemeral: true,
            content: `❌ - <@${DiscordClient?.user?.id}> can only run on a server.`,
        });
        return;
    }

    try {
        await command.callback(DiscordClient, interaction, guildID);
    } catch(e) {
        interaction.reply({
            ephemeral: true,
            content: `❌ - An error occured on the bot: \`\`\`${e}\`\`\``
        });
    }
    return;
});


// Discord Checks on message create & update
async function HeimdallChecks(message: Message) {
    if (message.author.id === DiscordClient.user?.id) return; // Let's ignore our own messages
    if (!message.guild) return; // No need to do that in DMs

    // Get guild's options
    const Guild_ID = message.guild?.id;
    const { options = {} } = await DiscordClient.database?.getGuildConfig(Guild_ID) as HeimdallServerConfig || {};

    if (!options) return; // Checks are useless if no options have been enabled.

    // Proceeds to check for phishing links, spam, etc...
    if (options.anti_phishing_links) phishingLinksCheck(message);
    if (options.spam_protection) spamCheck(message);
}

DiscordClient.on("messageCreate", HeimdallChecks);
DiscordClient.on("messageUpdate", async (oldMessage, newMessage) => { return HeimdallChecks(newMessage as Message); });

// Login & Export
DiscordClient.login(config.DISCORD_TOKEN);
export default DiscordClient;