// Servers Table Type
export type Server = {
	id: number;
	guild_id: string;
};

// Heimdall Server Config Type
export type HeimdallServerConfig = {
	verified_role: string;
	options: Record<string, boolean>;
};

// Heimdall Server Options
export const HeimdallServerOptions = [
	{
		name: "Members Verification",
        description: "Allows the bot to verify members on the server",
		value: "verification",
	},
	{
		name: "Access logs",
        description: "Allows the bot to log join/leave actions on the server",
		value: "logs",
	},
	{
		name: "Spam Protection",
        description: "Allows the bot to protect the server from spam / flood",
		value: "spam_protection",
	},
	{
		name: "Anti-raid",
        description: "Allows the bot to protect the server from raids",
		value: "anti_raid",
	},
];

// Servers_Config Table Type
export type ServerConfig = {
	id: number;
	config: string;
	server_id: number;
};

// Users Type
export type User = {
	id: number;
	discord_id: string;
	fingerprint: string;
};
