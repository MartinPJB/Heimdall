/* Command /toggle {Option} */
// Dependencies
import { ChatInputCommandInteraction } from "../../mod.ts";

// Types & Interfaces
import { Command } from "../ts/interfaces/Command.ts";
import { HeimdallClient } from "../ts/interfaces/Heimdall.ts";
import {
    HeimdallServerConfig,
    HeimdallServerOptions,
} from "../../database/ts/types/DataTypes.ts";

// Command
const options: Command = {
    name: "options",
    description: "Displays the current options set on the server.",
    default_member_permissions: 4, // Ban members permission

    /**
     * Interaction command callback
     * @param client - Bot client
     * @param interaction - Interaction
     * @param guildID - The Guild's ID
     */
    callback: async (client: HeimdallClient, interaction: ChatInputCommandInteraction, guildID: string) => {
        const { options, verified_role } = client.database?.getGuildConfig(guildID) as HeimdallServerConfig;
        const availableOptions = HeimdallServerOptions.map((option) => {
            return {
                name: option.name,
                description: option.description,
                value: options[option.value] ? "`✅ Enabled`" : "`❌ Disabled`",
            };
        });

        const verificationRole = verified_role && verified_role !== "" ? interaction.guild?.roles.cache.find((role) => role.id === verified_role) : "`No role set, you can set one by running /setverifiedrole`";
        interaction.reply({
            ephemeral: true,
            content: `🛡️ - Here are the current options set on the server:`,
            embeds: [
                {
                    title: `${interaction.guild?.name} Server's Options`,
                    thumbnail: {
                        url: interaction.guild?.iconURL() || "",
                    },
                    footer: {
                        text: `Heimdall - ${Date.now()}`,
                    },
                    fields: [
                        {
                            name: "Verified Role",
                            value: `${verificationRole}`,
                            inline: false,
                        },

                        ...availableOptions.map((option) => {
                            return {
                                name: option.name,
                                value: `${option.value} -- *${option.description}*`,
                                inline: false,
                            };
                        }),
                    ],
                    color: 0x4bd6f7,
                },
            ],
        });
    },
};

// Export
export default options;
