/* Command /setverificationchannel */
// Dependencies
import { ChatInputCommandInteraction, PermissionFlagsBits, InteractionOptionTypes } from "../../mod.ts";
import { TextChannel } from "discord.js";

// Types & Interfaces
import { Command } from "../ts/interfaces/Command.ts";
import { HeimdallClient } from "../ts/interfaces/Heimdall.ts";
import { HeimdallServerConfig } from "../../database/ts/types/DataTypes.ts";

// Command
const setVerificationChannel: Command = {
    name: "setverificationchannel",
    description: "Sets the channel in which the bot will set its verification message.",
    default_member_permissions: 4, // Ban members permission
    options: [
        {
            name: "channel",
            description: "The chosen channel (must be readable for newcomers!)",
            type: InteractionOptionTypes.CHANNEL,
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
        const channel: TextChannel = interaction.options.getChannel("channel")!;
        const channelPermissions = interaction.guild?.members.me?.permissionsIn(channel.id)!;
        const canAccessChannel = (channelPermissions.has(PermissionFlagsBits.SendMessages) && channelPermissions.has(PermissionFlagsBits.ViewChannel));

        // Can't access the channel chosen by the user
        if (!canAccessChannel) {
            interaction.reply({
                ephemeral: true,
                content: `❌ - <@${client?.user?.id}> has no access to channel <#${channel.id}>. Please make sure the bot can view the channel and send messages in it.`,
            });
            return;
        }

        const currentConfig = client.database?.getGuildConfig(guildID);
        let guildConfig: HeimdallServerConfig = {
            verification_channel_id: channel.id,
            verified_role: currentConfig?.verified_role || "",
        };

        try {
            await client.database?.setGuildConfig(guildID, guildConfig);
            interaction.reply({
                ephemeral: true,
                content: `🛡️ - Verification channel has been set to <#${channel.id}> successfully.`
            });
        } catch(e) {
            interaction.reply({
                ephemeral: true,
                content: `❌ - An error occured on the bot: \`\`\`${e}\`\`\``
            });
        }
    }
}

// Export
export default setVerificationChannel;