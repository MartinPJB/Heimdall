// Dependencies
import { Message } from "discord.js";
import config from "../../config.ts";
import NodeCache from "node-cache";

// Variables
const URLRegex = /(https?:\/\/)?([a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+)/g;
const BlacklistCache = new NodeCache({ stdTTL: 86400 }); // Valid for 24 hours

// Functions
/**
 * Extracts all URLs from a text input
 * @param input - The text input
 * @returns - An array of all the URLs found in the text input
 */
function extractDomains(input: string): string[] {
    const domains: string[] = [];
    let match;

    while ((match = URLRegex.exec(input)) !== null) {
        domains.push(match[2]);
    }

    return domains;
}

/**
 * The blacklist is really big, so sending a request every message would be
 * insanely fucking stupid and would slow down the code sooo, let's just fetch
 * it once and save it in the cache for 24 hours (as it's updated daily).
 * @returns - The blacklisted domains JSON
 */
async function getBlacklistFromCache(): Promise<string[]> {
    const cachedBlacklist = BlacklistCache.get("list");
    if (cachedBlacklist) return cachedBlacklist as string[];

    const listRequest = await fetch(config.PHISHFORT_LIST, { method: "GET" });
    const list = await listRequest.json();
    BlacklistCache.set("list", list);

    return list as string[];
}


/**
 * Checks if any phishing link is sent on discord.
 * @param message - Message object from discord
 * @returns - Nothing
 */
export default async function phishingLinksCheck(message: Message) {
    const blacklist = await getBlacklistFromCache();
    const urls = [... new Set(extractDomains(message.content))]; // Removes duplicates at the same time

    if (!urls || urls.length <= 0) return;

    for (const url of urls) {
        if (blacklist.includes(url)) {
            if (message.deletable) {
                await message.delete();
                await message.channel.send(`${message.author} - **Phishing links are not allowed in the chat. Please refrain from sending those.** ❌`);
            }

            break;
        }
    }
}