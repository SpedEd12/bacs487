// backend/routes/account_auth.js

const express = require("express");
const router = express.Router();

// Import account logic functions
const {
  createAccount,
  login,
  verifyCode,
  deleteAccount,
} = require("../user/account");

// Simple test route to confirm router is mounted
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "auth" });
});

// ============================
//  POST /auth/register
// ============================
router.post("/register", async (req, res) => {
  const { email, password, displayName, userRole } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required." });
  }

  try {
    const result = await createAccount({
      email,
      password,
      displayName,
      userRole,
    });

    // result is expected like: { userId, verificationCode }
    return res.status(201).json({
      message: "Account created successfully",
      ...result,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(400)
      .json({ error: err.message || "Failed to create account" });
  }
});

// ============================
//  POST /auth/login
// ============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required." });
  }

  try {
    const result = await login({ email, password });
    // result expected: { success: true/false, userId?, reason? }

    if (!result.success) {
      return res
        .status(401)
        .json({ error: result.reason || "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      userId: result.userId,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during login" });
  }
});

// ============================
//  POST /auth/verify
// ============================
router.post("/verify", async (req, res) => {
  const { userId, code } = req.body; // code is the 6-digit verification code

  if (!userId || !code) {
    return res
      .status(400)
      .json({ error: "userId and code are required for verification." });
  }

  try {
    const result = await verifyCode({ userId, code });

    if (!result.success) {
      return res
        .status(400)
        .json({ error: result.reason || "Invalid or expired code." });
    }

    return res.json({ message: "Account verified successfully." });
  } catch (err) {
    console.error("Verify error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during verification." });
  }
});

// ============================
//  DELETE /auth/:userId
// ============================
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await deleteAccount({ userId });
    return res.json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Delete account error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error during delete." });
  }
});

module.exports = router;
