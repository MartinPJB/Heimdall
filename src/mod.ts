// Imports local ts files
import config from "./config.ts";
import DiscordClient from "./bot/index.ts";

// Exports modules
export {
    Client,
    GatewayIntentBits,
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
    PermissionFlagsBits,
} from 'discord.js';

// Exports local ts files
export {
    HeimdallDB,
    _Database
} from "./database/index.ts";

export { InteractionOptionTypes } from "./bot/ts/enum/InteractionOptionTypes.ts";

export {
    config,
    DiscordClient
}