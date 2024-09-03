// Dependencies
import { assert } from "console";
import { DiscordClient } from "./src/mod.ts";

// Assets
assert(DiscordClient !== null, "%o", { error: "No discord client has been initialized." });