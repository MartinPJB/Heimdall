// Dependencies
import { Column } from "./Column.ts";

// Table type
export type Table = {
    name: string; // Table's name
    columns: Column[]; // Array of column definitions
    additional?: string; // Additional SQL
}