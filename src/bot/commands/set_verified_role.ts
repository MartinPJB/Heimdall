/* Command /setverifiedrole */
// Dependencies
import { ChatInputCommandInteraction, PermissionFlagsBits, InteractionOptionTypes } from "../../mod.ts";
import { APIRole, Role } from "discord.js";

// Types & Interfaces
import { Command } from "../ts/interfaces/Command.ts";
import { HeimdallClient } from "../ts/interfaces/Heimdall.ts";
import { HeimdallServerConfig } from "../../database/ts/types/DataTypes.ts";

// Command
const setVerifiedRole: Command = {
    name: "setverifiedrole",
    description: "Sets the role to give to players after their verification on the server",
    default_member_permissions: 4, // Ban members permission
    options: [
        {
            name: "role",
            description: "The chosen role (the bot must be able to assign it to users)",
            type: InteractionOptionTypes.ROLE,
            required: true,
        }
    ],

    /**
     * Interaction command callback
     * @param client - Bot client
     * @param interaction - Interaction
     * @param guildID - The Guild's ID
     */
    callback: async (client: HeimdallClient, interaction: ChatInputCommandInteraction, guildID: string) => {
        const role: Role = interaction.options.getRole("role")! as Role;

        if (!role.editable) {
            interaction.reply({
                ephemeral: true,
                content: `❌ - <@${client?.user?.id}> has no access to the role ${role}. Please make sure the bot has the permissions to edit that role.`,
            });
            return;
        }

        const currentConfig = client.database?.getGuildConfig(guildID);
        let guildConfig: HeimdallServerConfig = {
            verification_channel_id: currentConfig?.verification_channel_id || "",
            verified_role: role.id,
        };

        await client.database?.setGuildConfig(guildID, guildConfig);
        interaction.reply({
            ephemeral: true,
            content: `🛡️ - Role set successfully to ${role}.`
        });
    }
}

// Export
export default setVerifiedRole;