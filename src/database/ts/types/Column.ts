// Column type
export type Column = {
    name: string; // Column name
    type: string; // Data type (e.g. TEXT, INTEGER)
    primaryKey?: boolean; // Is this column a primary key?
    autoIncrement?: boolean; // Does this column auto-increment?
    notNull?: boolean; // Is this column NOT NULL?
    unique?: boolean; // Is this column UNIQUE?
}