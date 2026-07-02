import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { getDirectDatabaseUrl, sanitizeUrl } from "./db-env.mjs";

const databaseUrl = getDirectDatabaseUrl();

console.log(`Connecting to: ${sanitizeUrl(databaseUrl)}`);

const sql = neon(databaseUrl);
const schema = await readFile(
  new URL("../db/schema.sql", import.meta.url),
  "utf8",
);

for (const statement of splitSql(schema)) {
  try {
    await sql.query(statement);
  } catch (err) {
    console.error(`Failed to execute statement: ${statement.slice(0, 100)}...`);
    console.error(err.message);
    process.exit(1);
  }
}

console.log("Database schema is up to date.");

function splitSql(input) {
  const statements = [];
  let current = "";
  let inDollarBlock = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const pair = input.slice(index, index + 2);

    if (pair === "$$") {
      inDollarBlock = !inDollarBlock;
      current += pair;
      index++;
      continue;
    }

    if (char === ";" && !inDollarBlock) {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }

    current += char;
  }

  const statement = current.trim();
  if (statement) statements.push(statement);
  return statements;
}
