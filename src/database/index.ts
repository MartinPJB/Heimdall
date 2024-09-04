// Dependencies
import _Database from "./database.ts";
import { HeimdallServerConfig, Server, ServerConfig } from "./ts/types/DataTypes.ts";


class HeimdallDB {
    private DatabaseClass!: _Database;

    constructor() {
        this.DatabaseClass = new _Database();
        this.DatabaseClass.init();

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
        return this.DatabaseClass.select("servers", ["id", "guild_id"], { guild_id })[0] as Server;
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
    getGuildConfig(guild_id: string): HeimdallServerConfig | null {
        const guild = this.getGuild(guild_id);
        const { config } = this.DatabaseClass.select("servers_config", ["config"], {
            server_id: guild.id
        })[0] as ServerConfig;

        const exportedConfig: HeimdallServerConfig = JSON.parse(config);

        return config ? exportedConfig : null;
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

                return res(true);
            } catch(e) {
                return rej(e);
            }
        });
    }
}

export { _Database, HeimdallDB };
