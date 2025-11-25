# docker-compose.yml

This file defines services (like the Postgres database) that are needed for local development.

## What it’s for
The `docker-compose.yml` file sets up a local environment for running the backend with Postgres (and pgAdmin, if desired). It ensures you can run the app on your local machine easily.

## Frontend connection
Provides a local database for the backend API to interact with, making sure data is available for the frontend to fetch.
