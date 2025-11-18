# app.ts
Builds the Express app: applies middleware (CORS, JSON), mounts feature routers, sets `/health`.

## Frontend connection
This is where routes like `/auth`, `/listings`, `/users`, etc. are attached for the frontend to call.
