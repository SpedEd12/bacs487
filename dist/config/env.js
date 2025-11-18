"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config"); // Loads .env file into process.env
const zod_1 = require("zod"); // Used for validation
// Define a schema for the environment variables
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number()).default(4000),
    DATABASE_URL: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().default("dev-secret"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:3000"), // Your frontend URL
});
// Parse and validate the environment variables
exports.env = schema.parse(process.env);
