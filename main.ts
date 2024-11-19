// Dependencies
import { assert } from "console";
import { DiscordClient, startWebServer } from "./src/mod.ts";

// Assets
assert(DiscordClient !== null, "%o", { error: "No discord client has been initialized." });
assert(startWebServer !== null, "%o", { error: "No website has been initialized." });

// Start webserver
startWebServer();