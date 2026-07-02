import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl, sanitizeUrl } from "./db-env.mjs";

const databaseUrl = getDatabaseUrl();
console.log(`Connecting to: ${sanitizeUrl(databaseUrl)}`);

const sql = neon(databaseUrl);

const statements = [
  "truncate table user_feedback restart identity cascade",
  "truncate table metrics_snapshots restart identity cascade",
  "truncate table watchlist restart identity cascade",
  "truncate table basket_members restart identity cascade",
  "truncate table baskets restart identity cascade",
  "truncate table ideas restart identity cascade",
  "truncate table article_extractions restart identity cascade",
  "truncate table articles restart identity cascade",
  "truncate table scan_runs restart identity cascade",
];

for (const statement of statements) {
  await sql.query(statement);
}

console.log("Reset generated app data. Sources were preserved.");
