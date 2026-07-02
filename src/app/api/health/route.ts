import { NextRequest } from "next/server";
import { getStorageMode, getStore } from "@/lib/storage";
import { getDatabaseUrl, getDirectDatabaseUrl } from "@/lib/storage/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const storageMode = getStorageMode();
  const hasDatabaseUrl = Boolean(getDatabaseUrl());
  const hasDirectDatabaseUrl = Boolean(getDirectDatabaseUrl());

  let dbConnected = false;
  let schemaReady = false;
  let error: string | undefined;
  let errorCode: string | undefined;

  if (hasDatabaseUrl) {
    try {
      const store = getStore();

      try {
        await store.getSources();
        dbConnected = true;
        schemaReady = true;
      } catch (e: Error) {
        dbConnected = true;
        error = e.message;
        if (
          e.message.toLowerCase().includes("relation") &&
          e.message.toLowerCase().includes("does not exist")
        ) {
          schemaReady = false;
          errorCode = "schema_missing";
        } else {
          dbConnected = false;
          errorCode = "connection_failed";
        }
      }
    } catch (e: Error) {
      dbConnected = false;
      error = e.message;
      errorCode = "initialization_failed";
    }
  }

  return Response.json({
    ok: dbConnected && schemaReady,
    app: "WallStreetScout",
    storage: storageMode,
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl,
      hasDirectDatabaseUrl,
    },
    db: {
      connected: dbConnected,
      schemaReady,
      errorCode,
      error,
    },
  });
}
