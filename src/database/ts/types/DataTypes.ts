// Servers Table Type
export type Server = {
    id: number;
    guild_id: string;
}

// Heimdall Server Config Type
export type HeimdallServerConfig = {
    verified_role: string;
    options: Record<string, boolean>;
}

// Heimdall Server Options
export const HeimdallServerOptions = [
    {
        name: "Members Verification",
        value: "verification"
    }
];


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