import Database from "better-sqlite3";
import DataLoader from "dataloader";

export class DB {
  private db;
  private static instance: DB;
  private static file: string | undefined;
  private constructor(public file: string) {
    const db = new Database(file);
    db.pragma("journal_mode = WAL");
    db.exec(
      "create table users(id integer PRIMARY KEY AUTOINCREMENT, first_name text not null, last_name text not null );"
    );

    // console.log(`Initializing ${file}`);
    this.db = db;
  }

  static setFile(file: string) {
    this.instance = new DB(file);
    this.file = file;
  }

  static getInstance() {
    if (DB.instance) {
      return DB.instance;
    }

    if (!DB.file) {
      throw new Error("File not set");
    }
    const db = new DB(DB.file);
    DB.instance = db;
    return db;
  }

  async get(query: string, values: any[]) {
    if (values) {
      return this.db.prepare(query).get(values);
    }
    return this.db.prepare(query).get();
  }

  async getAll(query: string, values: any[]) {
    if (values) {
      return this.db.prepare(query).all(values);
    }
    return this.db.prepare(query).all();
  }

  async exec(query: string, values: any[]) {
    return this.db.prepare(query).run(values);
  }
}

export function createDataLoader(fields: string[]) {
  return new DataLoader(async (ids: number[]) => {
    if (!ids.length) {
      return [];
    }

    const db = DB.getInstance();
    const rows = await db.getAll(
      `select ${fields.join(",")} from users where id in (${Array(ids.length)
        .fill("?")
        .join(",")})`,
      ids
    );
    const m = new Map();
    for (const row of rows) {
      m.set(row.id, row);
    }
    const results: any = [];
    for (const id of ids) {
      results.push(m.get(id) ?? null);
    }
    return results;
  });
}
