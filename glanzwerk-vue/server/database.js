import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function openDatabase(filename = "./data/glanzwerk.sqlite") {
  if (filename !== ":memory:")
    mkdirSync(dirname(resolve(filename)), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  database.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  return database;
}
