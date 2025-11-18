import "dotenv/config";  // Loads .env file into process.env
import { z } from "zod";  // Used for validation

// Define a schema for the environment variables
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), z.number()).default(4000),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default("dev-secret"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),  // Your frontend URL
});

// Parse and validate the environment variables
export const env = schema.parse(process.env);
