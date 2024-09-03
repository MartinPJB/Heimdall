// Dependencies
import "dotenv/config";

// Env
interface Config {
    DISCORD_TOKEN: string;
    DISCORD_CLIENTID: string;
    DISCORD_CLIENTSECRET: string;
    DISCORD_REDIRECTURI: string;
    ENCRYPT_KEY: string;
}

const config: Config = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN ?? "", // Discord Bot Token
    DISCORD_CLIENTID: process.env.DISCORD_CLIENTID ?? "", // Discord Client ID
    DISCORD_CLIENTSECRET: process.env.DISCORD_CLIENTSECRET ?? "", // Discord Client Secret
    DISCORD_REDIRECTURI: process.env.DISCORD_REDIRECT_URI ?? "", // Discord Redirect URI for OAuth
    ENCRYPT_KEY: process.env.ENCRYPT_KEY ?? "", // Encryption key for the database's content
};

export default config;