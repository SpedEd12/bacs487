// backend/user/account.js

/*
=========================================================
USER ACCOUNT MANAGEMENT (users table)
=========================================================

This module handles EVERYTHING related to user accounts:

- Creating new user accounts
- Validating UNC emails
- Hashing passwords (bcrypt)
- Generating & expiring verification codes
- Logging users in
- Verifying accounts
- Deleting accounts

Used by: Registration page, Login page, Verification code form, Account settings.
*/

const bcrypt = require("bcrypt");
const crypto = require("crypto");

// MySQL connection pool (db.js is in backend/db/db.js)
const pool = require("../db/db");

/* -------------------------------------------------------
   EMAIL VALIDATION HELPERS
   -------------------------------------------------------
   UNC rules:
   - Students must use: username@bears.unco.edu
   - Faculty must use : username@unco.edu

   Note: For now, student and faculty have the same permissions
   in the app. This is mainly for validation and data clarity.
------------------------------------------------------- */
function validateEmailForRole(email, userRole = "student") {
  const studentPattern = /.+@bears\.unco\.edu$/i;
  const facultyPattern = /.+@unco\.edu$/i;

  if (userRole === "student" && !studentPattern.test(email)) {
    throw new Error("Students must use a bears.unco.edu email");
  }
  if (userRole === "faculty" && !facultyPattern.test(email)) {
    throw new Error("Faculty must use a unco.edu email");
  }
  // Admins can be handled later with custom rules if needed.
}

/* -------------------------------------------------------
   VERIFICATION CODE HELPERS
   -------------------------------------------------------
   Generates a 6-digit cryptographically secure code.
   Computes a timestamp 15 minutes in the future.
------------------------------------------------------- */
function generateVerificationCode() {
  // Crypto gives a safer random number than Math.random()
  const num = crypto.randomInt(100000, 1000000); // 100000–999999
  return String(num);
}

function getVerificationExpiryDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 15); // expires in 15 minutes
  return now;
}

/* =======================================================
   CREATE ACCOUNT
   =======================================================
   1. Validates UNC email based on role
   2. Hashes password with bcrypt
   3. Generates verification code & expiry
   4. Inserts new record into `users` table
   5. Returns (userId, verificationCode)

   Expected users table fields:
   - user_id (INT, PK)
   - unc_email (VARCHAR, UNIQUE, NOT NULL)
   - password_hash (VARCHAR, NOT NULL)
   - display_name (VARCHAR, nullable)
   - user_role (ENUM: 'student','faculty','admin')
   - is_verified (BOOLEAN/TINYINT)
   - verification_code (VARCHAR)
   - verification_expiry (DATETIME)
   - created_at (TIMESTAMP)
   - last_login (DATETIME)
======================================================= */
async function createAccount({ email, password, displayName, userRole = "student" }) {
  // Validate email domain for given role
  validateEmailForRole(email, userRole);

  // Hash password securely
  const hashed = await bcrypt.hash(password, 10);

  // Generate verification details
  const code = generateVerificationCode();
  const expiry = getVerificationExpiryDate();

  // Insert into DB
  const sql = `
    INSERT INTO users
      (unc_email, password_hash, display_name, user_role, is_verified, verification_code, verification_expiry)
    VALUES
      (?, ?, ?, ?, 0, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    email,
    hashed,
    displayName || null,
    userRole,
    code,
    expiry,
  ]);

  // Return info to use in frontend or email system
  return {
    userId: result.insertId,
    verificationCode: code,
  };
}

/* =======================================================
   LOGIN
   =======================================================
   1. Fetch user by email
   2. Compare input password with bcrypt hash
   3. Reject if not verified
   4. Update last_login timestamp
   5. Return login success + user ID
======================================================= */
async function login({ email, password }) {
  const sql = `
    SELECT user_id, password_hash, is_verified
    FROM users
    WHERE unc_email = ?
  `;

  const [rows] = await pool.query(sql, [email]);

  // No such account
  if (rows.length === 0) {
    return { success: false, reason: "No such account" };
  }

  const user = rows[0];

  // Check the hashed password
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return { success: false, reason: "Incorrect password" };
  }

  // Account exists but email not verified yet
  if (!user.is_verified) {
    return { success: false, reason: "Account not verified" };
  }

  // Update login timestamp
  await pool.query(
    "UPDATE users SET last_login = NOW() WHERE user_id = ?",
    [user.user_id]
  );

  return { success: true, userId: user.user_id };
}

/* =======================================================
   VERIFY ACCOUNT CODE
   =======================================================
   1. Fetch stored verification_code and expiry
   2. Compare codeInput with stored code
   3. Check if code is expired
   4. If successful: mark user as verified & clear code fields
======================================================= */
async function verifyCode({ userId, codeInput }) {
  // Fetch verification info
  const sql = `
    SELECT verification_code, verification_expiry
    FROM users
    WHERE user_id = ?
  `;
  const [rows] = await pool.query(sql, [userId]);

  if (rows.length === 0) {
    return { success: false, reason: "Account not found" };
  }

  const user = rows[0];

  // No verification code stored
  if (!user.verification_code || !user.verification_expiry) {
    return { success: false, reason: "No verification code set" };
  }

  // Check expiry
  const expiry = new Date(user.verification_expiry);
  const now = new Date();
  if (now > expiry) {
    return { success: false, reason: "Code expired" };
  }

  // Wrong code
  if (String(user.verification_code) !== String(codeInput)) {
    return { success: false, reason: "Invalid code" };
  }

  // Mark user as verified and clear code/expiry
  const updateSql = `
    UPDATE users
    SET is_verified = 1,
        verification_code = NULL,
        verification_expiry = NULL
    WHERE user_id = ?
  `;
  await pool.query(updateSql, [userId]);

  return { success: true, message: "Verified successfully" };
}

/* =======================================================
   DELETE ACCOUNT
   =======================================================
   WARNING: PERMANENT. No recovery.
   Cascades delete to listings, messages, etc. if FK defined.
======================================================= */
async function deleteAccount({ userId }) {
  const sql = "DELETE FROM users WHERE user_id = ?";
  await pool.query(sql, [userId]);
  return { success: true };
}

module.exports = {
  createAccount,
  login,
  verifyCode,
  deleteAccount,
};
