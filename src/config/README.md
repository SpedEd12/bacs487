# src/config
Configuration utilities (env variables, logger).

## What it’s for
- `env.ts`: loads and validates `.env` values
- `logger.ts`: (optional) consistent logging

## Frontend connection
Controls `CORS_ORIGIN` so the browser frontend can call the API without CORS errors.
