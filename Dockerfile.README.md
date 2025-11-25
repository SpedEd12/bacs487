# Dockerfile

This file defines the environment for building a production-ready Docker image for the BearExchange backend.

## What it’s for
The `Dockerfile` specifies how to package the application, its dependencies, and runtime environment into a container for deployment.

## Frontend connection
The Docker container serves the API that the frontend (React/HTML) will communicate with. It ensures the backend runs in a consistent environment.
