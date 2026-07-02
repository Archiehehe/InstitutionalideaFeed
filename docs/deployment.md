# WallStreetScout Deployment Guide

## Prerequisites

1.  **Neon Database**
    *   Create a new project on [Neon](https://neon.tech).
    *   Get your **Pooled** connection string (for `DATABASE_URL`).
    *   Get your **Direct** connection string (for `DIRECT_DATABASE_URL`).

2.  **Finance APIs** (Optional for market data features)
    *   FMP_API_KEY
    *   FINNHUB_API_KEY
    *   ALPHA_VANTAGE_API_KEY
    *   SEC_API_KEY

## Environment Variables

Set the following in Vercel or your local `.env` file:

```bash
# Required
DATABASE_URL=postgresql://... (Pooled)
DIRECT_DATABASE_URL=postgresql://... (Unpooled)

# Optional
FINNHUB_API_KEY=
FMP_API_KEY=
ALPHA_VANTAGE_API_KEY=
SEC_API_KEY=
```

## Fresh Database Setup

After configuring environment variables:

1.  **Initialize Schema & Core Sources**
    ```bash
    npm run db:setup
    ```
    This runs `db:migrate` (applies `db/schema.sql`) and `db:seed` (syncs core institutional sources).

2.  **Import Starter Conviction Lists**
    ```bash
    npm run conviction:import-seed
    ```
    This populates the database with initial institutional stock lists.

## Verification

Visit the health endpoint to verify the setup:
`https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "ok": true,
  "app": "WallStreetScout",
  "storage": "neon",
  "db": {
    "connected": true,
    "schemaReady": true
  }
}
```

## Troubleshooting

*   **"Storage is not configured"**: Ensure `DATABASE_URL` is set in Vercel.
*   **"Schema missing"**: Run `npm run db:setup` locally with the production connection strings.
*   **"Failed to fetch"**: Check `/api/health` for specific database connection errors.
