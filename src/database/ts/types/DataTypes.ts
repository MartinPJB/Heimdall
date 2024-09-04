// Servers Table Type
export type Server = {
    id: number;
    guild_id: string;
}

// Heimdall Server Config Type
export type HeimdallServerConfig = {
    verification_channel_id: string;
    verified_role: string;
}

// Servers_Config Table Type
export type ServerConfig = {
    id: number;
    config: string;
    server_id: number;
}

// Users Type
export type User = {
    id: number;
    discord_id: string;
    fingerprint: string;
}