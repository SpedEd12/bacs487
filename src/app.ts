import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";  // Loads environment variables
import errorHandler from "./middleware/errorHandler";  // Global error handler

const app = express();

// Middleware
app.use(helmet());  // Adds security headers
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));  // CORS for frontend
app.use(express.json());  // Parse JSON bodies

// Health check route
app.get("/health", (_req, res) => res.json({ ok: true }));

// TODO: Mount your feature routers here later (e.g., app.use("/auth", authRouter);)

app.use(errorHandler);  // Error handling middleware

export default app;




