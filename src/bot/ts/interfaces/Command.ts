// Dependencies
import { Client, ChatInputCommandInteraction, ApplicationCommandOptionType } from "../../../mod.ts";

// Interfaces
interface CommandOption {
    name: string;
    description: string;
    type: number | ApplicationCommandOptionType; // Use the enum from discord.js for type safety
    required?: boolean;
};

interface Command {
    name: string;
    description: string;
    default_member_permissions?: bigint | number; // Permissions can be a string or number
    options?: CommandOption[]; // An array of options
    callback: (client: Client, options: ChatInputCommandInteraction) => Promise<void> | void; // The callback function
};

interface RegisterableCommand {
    name: string;
    description: string;
    default_member_permissions?: bigint | number;
    options?: CommandOption[];
};

// Export
export { Command, RegisterableCommand, CommandOption };