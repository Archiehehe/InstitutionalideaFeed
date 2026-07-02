export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function getDirectDatabaseUrl(): string | undefined {
  return process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
}
