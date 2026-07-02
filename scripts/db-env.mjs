import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Load .env.local if it exists, otherwise .env
const envLocal = resolve(process.cwd(), ".env.local");
const envDefault = resolve(process.cwd(), ".env");

if (existsSync(envLocal)) {
  config({ path: envLocal });
} else if (existsSync(envDefault)) {
  config({ path: envDefault });
}

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.STORAGE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL or STORAGE_URL environment variable is required.",
    );
  }
  return url;
}

export function getDirectDatabaseUrl() {
  // Use DIRECT_DATABASE_URL first for migrations, then fallback to DATABASE_URL
  const url =
    process.env.DIRECT_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.STORAGE_URL;
  if (!url) {
    throw new Error(
      "DIRECT_DATABASE_URL or DATABASE_URL environment variable is required.",
    );
  }
  return url;
}

export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return "invalid-url";
  }
}
