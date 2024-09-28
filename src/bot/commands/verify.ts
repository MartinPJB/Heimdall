/* Command /verify */
// Dependencies
import { ChatInputCommandInteraction, PermissionFlagsBits, InteractionOptionTypes } from "../../mod.ts";
import { GuildMember, Role, User } from "discord.js";

// Types & Interfaces
import { Command } from "../ts/interfaces/Command.ts";
import { HeimdallClient } from "../ts/interfaces/Heimdall.ts";
import { HeimdallServerConfig } from "../../database/ts/types/DataTypes.ts";

// Command
const verify: Command = {
    name: "verify",
    description: "Gives the verified role to a specific user w/o them having to go through the verification process",
    default_member_permissions: 4, // Ban members permission
    options: [
        {
            name: "user",
            description: "The chosen user",
            type: InteractionOptionTypes.USER,
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
        const user: User = interaction.options.getUser("user")!;
        const guildUser: GuildMember | undefined = interaction.guild?.members.cache.get(user.id);

        // No verified role has been set up in the config
        const config = await client.database?.getGuildConfig(guildID) as HeimdallServerConfig;
        if (!config || !config.verified_role) {
            interaction.reply({
                ephemeral: true,
                content: "❌ - No verified role has been set up on the server. You should run the command `/setverifiedrole` first to set up a role."
            });
            return;
        }

        // Guild user is impossible to find
        if (!guildUser) {
            interaction.reply({
                ephemeral: true,
                content: "❌ - User hasn't been found on the current server. Are you sure you entered the right one?"
            });
            return;
        }

        const { verified_role } = config;
        const role: Role = interaction.guild?.roles.cache.find(role => role.id === verified_role)!;

        await client.database?.setUser(guildUser.id);
        await guildUser.roles.add(role);

        interaction.reply({
            ephemeral: true,
            content: `🛡️ - User ${user} has been verified (${role}) successfully.`
        });
    }
}

// Export
export default verify;