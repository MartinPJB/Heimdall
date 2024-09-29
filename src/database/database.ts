// Dependencies
import Database from "better-sqlite3";
import { Table } from "./ts/types/Table.ts";

// Database Class
export default class _Database {
    protected db!: InstanceType<typeof Database>;

    /**
     * Initializes database
     */
    init() {
        this.db = new Database("./Heimdall.db", {
            //verbose: console.log,
        });

        this.db.pragma("foreign_keys = ON");
    }

    /**
     * Get the db property
     */
    getDatabase(): InstanceType<typeof Database> {
        return this.db;
    }


    /**
     * Creates a table with the specified structure and additional properties.
     * @param table - The table structure including name, entries, and additional SQL properties.
     */
    createTable(table: Table) {
        // Construct column definitions
        const columns = table.columns.map((entry) => {
            const constraints = [
                entry.primaryKey ? "PRIMARY KEY" : "",
                entry.autoIncrement ? "AUTOINCREMENT" : "",
                entry.notNull ? "NOT NULL" : "",
                entry.unique ? "UNIQUE" : "",
            ].filter(Boolean).join(" ");

            return `"${entry.name}" ${entry.type} ${constraints}`.trim();
        }).join(", ");

        // Construct the full SQL create table statement
        const sql = `CREATE TABLE IF NOT EXISTS "${table.name}" (${columns}${
            table.additional ? `, ${table.additional}` : ""
        });`;

        // Execute the SQL statement
        this.db.prepare(sql).run();
    }


    /**
     * Inserts data into a specified table.
     * @param table - The name of the table to insert data into.
     * @param data - An object representing the columns and values to insert.
     * @example
     * db.insert('users', { twitch_name: 'test_user', twitch_at: '@test', discord_id: '1234', discord_at: '@discord', isFollower: 1 });
     */
    insert(table: string, data: Record<string, unknown>) {
        const columns = Object.keys(data).join(", ");
        const values = Object.values(data).map(value => {
            if (typeof value === "object") return JSON.stringify(value);
            return value;
        });
        const placeholders = values.map(() => "?").join(", ");

        const query =
            `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

        console.log(query, values);
        return this.db.prepare(query).run(...values);
    }

    /**
     * Selects data from a table.
     * @param table - The name of the table to query.
     * @param columns - The columns to retrieve (default is all columns).
     * @param where - An object representing the WHERE conditions (optional).
     * @example
     * db.select('users', ['id', 'twitch_name'], { isFollower: 1 });
     * @returns An array of objects representing the selected rows.
     */
    select(
        table: string,
        columns: string[] = ["*"],
        where: Record<string, unknown> = {},
    ): unknown[] {
        const columnString = columns.join(", ");
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.length > 0
            ? "WHERE " + whereKeys.map((key) => `${key} = ?`).join(" AND ")
            : "";
        const values = Object.values(where);

        const query = `SELECT ${columnString} FROM ${table} ${whereClause}`;
        return this.db.prepare(query).all(...values);
    }

    /**
     * Selects data from multiple tables with JOIN operations.
     * @param table - The main table to select from.
     * @param joinClause - A string representing the JOIN conditions.
     * @param columns - The columns to retrieve (default is all columns).
     * @param where - An object representing the WHERE conditions (optional).
     * @example
     * db.selectJoin(
     *     'users',
     *     'JOIN orders ON users.id = orders.user_id',
     *     ['users.id', 'users.name', 'orders.amount'],
     *     { 'users.isFollower': 1 }
     * );
     * @returns An array of objects representing the selected rows.
     */
    selectJoin(
        table: string,
        joinClause: string,
        columns: string[] = ["*"],
        where: Record<string, unknown> = {},
    ): unknown[] {
        const columnString = columns.join(", ");
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.length > 0
            ? "WHERE " + whereKeys.map((key) => `${key} = ?`).join(" AND ")
            : "";
        const values = Object.values(where);

        const query = `SELECT ${columnString} FROM ${table} ${joinClause} ${whereClause}`;
        return this.db.prepare(query).all(...values);
    }

    /**
     * Updates data in a table.
     * @param table - The name of the table to update.
     * @param data - An object representing the columns and new values.
     * @param where - An object representing the WHERE conditions.
     * @example
     * db.update('users', { twitch_name: 'new_name' }, { id: 1 });
     */
    update(
        table: string,
        data: Record<string, unknown>,
        where: Record<string, unknown>,
    ) {
        const setString = Object.keys(data).map((key) => `${key} = ?`).join(
            ", ",
        );
        const values = Object.values(data).map(value => {
            if (typeof value === "object") return JSON.stringify(value);
            return value;
        });
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.length > 0
            ? "WHERE " + whereKeys.map((key) => `${key} = ?`).join(" AND ")
            : "";
        const whereValues = Object.values(where);

        const query = `UPDATE ${table} SET ${setString} ${whereClause}`;
        return this.db.prepare(query).run(...values, ...whereValues);
    }

    /**
     * Deletes data from a table.
     * @param table - The name of the table to delete data from.
     * @param where - An object representing the WHERE conditions.
     * @example
     * db.delete('users', { id: 1 });
     */
    delete(table: string, where: Record<string, unknown>) {
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.length > 0
            ? "WHERE " + whereKeys.map((key) => `${key} = ?`).join(" AND ")
            : "";
        const values = Object.values(where);

        const query = `DELETE FROM ${table} ${whereClause}`;
        this.db.prepare(query).run(...values);
    }
}
