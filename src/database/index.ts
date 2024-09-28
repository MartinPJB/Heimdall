// Dependencies
import NodeCache from "node-cache";
import _Database from "./database.ts";
import { HeimdallServerConfig, Server, ServerConfig, User } from "./ts/types/DataTypes.ts";


class HeimdallDB {
    private DatabaseClass!: _Database;
    private GuildConfigCache: NodeCache;
    private GuildsCache: NodeCache;

    constructor() {
        this.DatabaseClass = new _Database();
        this.DatabaseClass.init();

        // Caches for the guilds and their configs
        this.GuildConfigCache = new NodeCache({ stdTTL: 600 }); // Every 10 minutes
        this.GuildsCache = new NodeCache({ stdTTL: 3600 }); // Every hour

        this.createDefaultTables();
    }

    /**
     * Creates default tables if not existing already
     */
    createDefaultTables() {
        // Create the users table
        this.DatabaseClass.createTable({
            name: "users",
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
                { name: "discord_id", type: "TEXT", notNull: true },
                { name: "fingerprint", type: "TEXT" }
            ]
        });

        // Create the servers table
        this.DatabaseClass.createTable({
            name: "servers",
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
                { name: "guild_id", type: "TEXT", notNull: true }
            ]
        });

        // Create the servers_config table
        this.DatabaseClass.createTable({
            name: "servers_config",
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
                { name: "config", type: "TEXT" },
                { name: "server_id", type: "TEXT", notNull: true }
            ],
            additional: 'FOREIGN KEY("server_id") REFERENCES "servers"("id") ON DELETE CASCADE'
        });

        // Create the banned_users table
        this.DatabaseClass.createTable({
            name: "banned_users",
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true, autoIncrement: true },
                { name: "server_id", type: "TEXT", notNull: true },
                { name: "user_id", type: "TEXT", notNull: true }
            ],
            additional: 'FOREIGN KEY("server_id") REFERENCES "servers"("id") ON DELETE CASCADE, FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE'
        });
    }

    /**
     * Get a guild from the database from its ID
     * @param guild_id - The guild's ID
     * @returns - guild_id
     */
    getGuild(guild_id: string): Server {
        const cachedGuild = this.GuildsCache.get(guild_id);
        if (cachedGuild) return cachedGuild as Server;

        const guild = this.DatabaseClass.select("servers", ["id", "guild_id"], { guild_id })[0] as Server;
        this.GuildsCache.set(guild_id, guild);

        return guild;
    }

    /**
     * Add a guild to the database
     * @param guild_id - The guild's ID
     * @returns - A promise wether the guild's been added to the database or not
     */
    addGuild(guild_id: string): Promise<boolean> {
        return new Promise((res, rej) => {
            if (this.getGuild(guild_id)) return res(false);

            this.DatabaseClass.insert("servers", {
                guild_id
            });

            return res(true);
        });
    }

    /**
     * Get a config from a certain guild
     * @param guild_id - The guild's ID
     * @returns - The servers' config
     */
    async getGuildConfig(guild_id: string): Promise<HeimdallServerConfig | null> {
        const guild = this.getGuild(guild_id);
        const cachedConfig = this.GuildConfigCache.get<HeimdallServerConfig>(guild.id);

        if (cachedConfig) return cachedConfig; // Returns the cached config if existing.

        // Else, we get it from the DB and of course, set it in the cache.
        const serverConfig = this.DatabaseClass.select("servers_config", ["config"], { server_id: guild.id })[0] as ServerConfig;
        const config = serverConfig ? serverConfig.config : null;

        if (!config) return null;

        const exportedConfig: HeimdallServerConfig = JSON.parse(config);
        this.GuildConfigCache.set(guild.id, exportedConfig);

        return exportedConfig;
    }

    /**
     * Sets a config for a certain guild
     * @param guild_id - The guild's ID
     * @param config - The servers' config
     * @returns - A promise wether the guild config has been set properly or not
     */
    setGuildConfig(guild_id: string, config: Record<string, any>): Promise<any> {
        const stringify = JSON.stringify(config);
        const guild = this.getGuild(guild_id);

        return new Promise((res, rej) => {
            try {
                const existingConfig = this.getGuildConfig(guild_id);
                if (!existingConfig) this.DatabaseClass.insert("servers_config", { server_id: guild.id, config: stringify });
                else this.DatabaseClass.update("servers_config", { config: stringify }, { server_id: guild.id });

                // Invalidates the existing config cache
                this.GuildConfigCache.del(guild.id);
                return res(true);
            } catch(e) {
                return rej(e);
            }
        });
    }

    /**
     * Get a user from the database from their discord ID
     * @param discord_id - Discord ID of the user
     * @returns - Registered user in the database
     */
    getUser(discord_id: string): User {
        return this.DatabaseClass.select("users", ["*"], { discord_id })[0] as User;
    }

    /**
     * Set a user to the database (if they exist in the DB, they will be updated)
     * @param discord_id - Discord ID of the user
     * @param fingerprint - Their registered fingerprint (optional)
     */
    setUser(discord_id: string, fingerprint: string = "NO_FINGERPRINT_REGISTERED"): Promise<boolean> {
        return new Promise((res, rej) => {
            const existingUser = this.getUser(discord_id);
            if (!existingUser) this.DatabaseClass.insert("users", { discord_id, fingerprint });
            else this.DatabaseClass.update("users", { fingerprint: fingerprint === "NO_FINGERPRINT_REGISTERED" ? existingUser.fingerprint : fingerprint }, { id: existingUser.id });

            return res(true);
        });
    }
}

export { _Database, HeimdallDB };
