// src/server.ts
import app from "./app";  // Import the app from app.ts
import { env } from "./config/env";  // Import environment variables

// Check if PORT is provided in the environment variables or fall back to 4000
const port = env.PORT || 4000;

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});







