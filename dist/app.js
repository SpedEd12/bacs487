"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env"); // Loads environment variables
const errorHandler_1 = __importDefault(require("./middleware/errorHandler")); // Global error handler
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)()); // Adds security headers
app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN, credentials: true })); // CORS for frontend
app.use(express_1.default.json()); // Parse JSON bodies
// Health check route
app.get("/health", (_req, res) => res.json({ ok: true }));
// TODO: Mount your feature routers here later (e.g., app.use("/auth", authRouter);)
app.use(errorHandler_1.default); // Error handling middleware
exports.default = app;
