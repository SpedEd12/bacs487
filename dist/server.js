"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const app_1 = __importDefault(require("./app")); // Import the app from app.ts
const env_1 = require("./config/env"); // Import environment variables
// Check if PORT is provided in the environment variables or fall back to 4000
const port = env_1.env.PORT || 4000;
app_1.default.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
