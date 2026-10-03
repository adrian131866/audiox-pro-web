declare module 'better-sqlite3' {
  class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): any;
    exec(sql: string): void;
    pragma(sql: string): any;
    close(): void;
  }
  export = Database;
}