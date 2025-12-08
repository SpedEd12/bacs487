// backend/src/app.js

const express = require("express");
const cors = require("cors");

const accountRoutes = require("../routes/account_auth");
const listingRoutes = require("../routes/listing_routes"); // OK even if mostly stubbed

const app = express();

// Allow frontend on localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Parse JSON bodies
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Log requests (helps debug paths)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Mount routers
app.use("/auth", accountRoutes);      // => /auth/register, /auth/login
app.use("/listings", listingRoutes);  // => /listings/...

// 404 handler (JSON)
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

module.exports = app;
