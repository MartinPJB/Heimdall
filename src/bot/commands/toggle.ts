/* Command /toggle {Option} */
// Dependencies
import { ChatInputCommandInteraction, InteractionOptionTypes } from "../../mod.ts";

// Types & Interfaces
import { Command } from "../ts/interfaces/Command.ts";
import { HeimdallClient } from "../ts/interfaces/Heimdall.ts";
import { HeimdallServerConfig, HeimdallServerOptions } from "../../database/ts/types/DataTypes.ts";

// Command
const toggle: Command = {
    name: "toggle",
    description: "Toggles a specific option on the server (verification, logs, etc.)",
    default_member_permissions: 4, // Ban members permission
    options: [
        {
            name: "option",
            description: "The chosen option",
            type: InteractionOptionTypes.STRING,
            required: true,

            choices: HeimdallServerOptions.map(option => {
                return {
                    name: option.name,
                    value: option.value
                }
            })
        },
        {
            name: "value",
            description: "The value to set",
            type: InteractionOptionTypes.BOOLEAN,
            required: true
        }
    ],

    /**
     * Interaction command callback
     * @param client - Bot client
     * @param interaction - Interaction
     * @param guildID - The Guild's ID
     */
    callback: async (client: HeimdallClient, interaction: ChatInputCommandInteraction, guildID: string) => {
        const option = interaction.options.getString("option")!;
        const value = interaction.options.getBoolean("value")!;

        // The option is empty or doesn't exist in HeimdallServerOptions
        if (!option || !HeimdallServerOptions.find(opt => opt.value === option)) {
            interaction.reply({
                ephemeral: true,
                content: "❌ - The option you're trying to toggle doesn't exist."
            });
            return;
        }

        const currentConfig = client.database?.getGuildConfig(guildID);
        let guildConfig: HeimdallServerConfig = {
            verification_channel_id: currentConfig?.verification_channel_id || "",
            verified_role: currentConfig?.verified_role || "",
            options: currentConfig?.options || {}
        };

        // Update the option
        guildConfig.options[option] = value;
        await client.database?.setGuildConfig(guildID, guildConfig);

        interaction.reply({
            ephemeral: true,
            content: `🛡️ - Option ${option} has been set to ${value ? "enabled" : "disabled"} successfully.`
        });
    }
}

// Export
export default toggle;