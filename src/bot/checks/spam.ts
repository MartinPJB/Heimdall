// Dependencies
import { Message, PermissionFlagsBits } from "discord.js";
import { UserMessage } from "./classes/SpamDetector.ts";
import SpamDetector from "./classes/SpamDetector.ts";

// Functions
/**
 * Checks if someone is spamming on discord
 * @param message - Message object from discord
 * @returns - Nothing
 */
export default async function spamCheck(message: Message) {
    const userMessage: UserMessage = {
        userId: message.author.id,
        message: message.content,
        timestamp: message.createdTimestamp
    }

    const isUserSpamming = SpamDetector.isUserSpamming(userMessage);
    const member = await message.guild?.members.cache.get(message.author.id);

    // !member?.permissions.has(PermissionFlagsBits.BanMembers) so like mods and higher ranks can still spam without consequences lol
    if (isUserSpamming && !member?.permissions.has(PermissionFlagsBits.BanMembers)) {
        const lastTO = SpamDetector.lastUsersWarn.get(message.author.id);
        if (!lastTO || (Date.now() - lastTO) > 15000) {
            SpamDetector.lastUsersWarn.set(message.author.id, Date.now());
            await message.channel.send(`${message.author} - **Spamming is prohibited.** ❌`);
        }

        // Tries to timeout for 60 seconds
        try {
            await member?.timeout(60_000);
        } catch(e) {
            if (e.rawError.code === 50013) return; // Missing permissions
            console.log(e);
        }
    }
}