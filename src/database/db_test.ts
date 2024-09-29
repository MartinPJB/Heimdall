// Dependencies
import _Database from "./database.ts";

// Variables
const db = new _Database();
db.init();

const serverTest = {
    guild_id: '123456789012345678__TEST',
    config: {},
};

// Tests Insert
console.log("TEST INSERT");
const { lastInsertRowid } = db.insert("servers", { guild_id: serverTest.guild_id });
db.insert("servers_config", { config: {}, server_id: lastInsertRowid });

// Tests Select
const selectTest = db.select("servers_config", ["*"]); /* -- */ console.log("TEST SELECT:\n", selectTest, "\n\n");
const selectJoinTest = db.selectJoin("servers", "JOIN servers_config ON servers_config.server_id = servers.id", ["guild_id"], { "servers.id": lastInsertRowid }); /* -- */ console.log("TEST SELECT JOIN:\n", selectJoinTest, "\n\n");

// Tests Update
console.log("TEST UPDATE");
db.update("servers_config", { config: { test: "TEST!!!" } }, { server_id: lastInsertRowid });

// Tests Delete
console.log("TEST DELETE");
db.delete("servers", { id: lastInsertRowid });