import Database from "better-sqlite3";
import * as fs from "fs";

afterAll(() => {
  fs.rmSync("test.db");
});

test("do it", () => {
  const db = new Database("test.db");
  db.pragma("journal_mode = WAL");
  db.exec(
    "create table users(first_name text not null, last_name text not null );"
  );

  const r = db.prepare("select * from users;").get([]);

  try {
    const r2 = db.prepare("select hello from users;").get([]);
    throw new Error("should throw");
  } catch (err) {
    console.log(err);
  }
});
