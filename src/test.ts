import * as fs from "fs";
import each from "jest-each";
import { DB, createDataLoader } from "./index";

function setup(file: string) {
  DB.setFile(file);
  const db = DB.getInstance();
  expect(db.file).toBe(file);
}

each([...Array(100).keys()]).describe("do it %s", (num) => {
  const file = `test${num}.db`;
  beforeAll(async () => {
    setup(file);

    const db = DB.getInstance();
    expect(db.file).toBe(file);

    await db.exec(
      "insert into users(first_name, last_name) values ('hello', 'world');",
      []
    );
    await db.exec(
      "insert into users(first_name, last_name) values ('jon', 'snow');",
      []
    );
    await db.exec(
      "insert into users(first_name, last_name) values ('jamie', 'lannister');",
      []
    );
    await db.exec(
      "insert into users(first_name, last_name) values ('tyrion', 'lannister');",
      []
    );
    await db.exec(
      "insert into users(first_name, last_name) values ('arya', 'stark');",
      []
    );
    await db.exec(
      "insert into users(first_name, last_name) values ('sansa', 'stark');",
      []
    );

    const r = await db.getAll("select * from users;", []);
    // console.log(r)
  });

  afterAll(() => {
    fs.rmSync(file);
    fs.rmSync(`${file}-wal`, {
      force: true,
    });
    fs.rmSync(`${file}-shm`, {
      force: true,
    });
  });

  test("query", async () => {
    const db = DB.getInstance();
    expect(db.file).toBe(file);

    await db.get("select * from users;", []);
  });

  test(`error`, async () => {
    const db = DB.getInstance();
    expect(db.file).toBe(file);

    try {
      await db.get("select hello from users;", []);
      throw new Error("should throw");
    } catch (err) {
      // console.log(err.message);
    }
  });

  test(`error all`, async () => {
    const db = DB.getInstance();
    expect(db.file).toBe(file);

    try {
      await db.getAll("select hello from users;", []);
      throw new Error("should throw");
    } catch (err) {
      // console.log(err.message);
    }
  });

  test("dataloader i id", async () => {
    const loader = createDataLoader(["*"]);
    const r = await loader.load(1);
    expect(r).toEqual({ id: 1, first_name: "hello", last_name: "world" });

    const r2 = await loader.load(3);
    expect(r2).toEqual({ id: 3, first_name: "jamie", last_name: "lannister" });
  });

  test("dataloader multi-ids", async () => {
    const loader = createDataLoader(["*"]);
    const r = await loader.loadMany([1, 3]);
    expect(r).toEqual([
      { id: 1, first_name: "hello", last_name: "world" },
      { id: 3, first_name: "jamie", last_name: "lannister" },
    ]);
  });

  test("dataloader i id. incorrect column", async () => {
    const loader = createDataLoader(["hello"]);
    await expect(loader.load(1)).rejects.toThrowError("hello");
  });

  test("dataloader multiple ids. incorrect column", async () => {
    const loader = createDataLoader(["hello"]);
    const r = await loader.loadMany([1, 2, 3]);
    for (const v of r) {
      expect(v instanceof Error).toBe(true);
      expect((v as Error).message).toMatch("hello");
    }
  });
});
