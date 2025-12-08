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
const pool = require("../db/db"); // MySQL connection pool

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
------------------------------------------------------- */
function generateVerificationCode() {
  // 6-digit cryptographically secure code
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
======================================================= */
async function createAccount({
  email,
  password,
  displayName,
  userRole = "student",
}) {
  // 1. Validate email domain for given role
  validateEmailForRole(email, userRole);

  // 2. Hash password securely
  const hashed = await bcrypt.hash(password, 10);

  // 3. Generate verification details
  const code = generateVerificationCode();
  const expiry = getVerificationExpiryDate();

  // 4. Insert into DB
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

  // 5. Return info to use in frontend or email system
  return {
    userId: result.insertId,
    verificationCode: code,
  };
}

/* =======================================================
   LOGIN
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
   VERIFY CODE
======================================================= */
/**
 * Verify a user's account using a code.
 * @param {Object} params
 * @param {number|string} params.userId - user_id from the database
 * @param {string} params.code - 6-digit verification code
 */
async function verifyCode({ userId, code }) {
  console.log("verifyCode() called with:", { userId, code });

  // Coerce to number and sanity-check
  const numericId = Number(userId);
  if (!numericId || Number.isNaN(numericId)) {
    console.log("verifyCode: invalid userId:", userId);
    return { success: false, reason: "Invalid user id" };
  }

  // Look up user by ID
  const [rows] = await pool.query(
    `
    SELECT user_id, verification_code, verification_expiry
    FROM users
    WHERE user_id = ?
    `,
    [numericId]
  );

  console.log("verifyCode: DB lookup result:", rows);

  if (!rows || rows.length === 0) {
    return { success: false, reason: "Account not found" };
  }

  const user = rows[0];

  if (!user.verification_code || !user.verification_expiry) {
    return { success: false, reason: "No active verification code" };
  }

  const now = new Date();
  const expiry = new Date(user.verification_expiry);

  if (now > expiry) {
    return { success: false, reason: "Verification code expired" };
  }

  if (String(user.verification_code) !== String(code)) {
    return { success: false, reason: "Invalid verification code" };
  }

  // Mark the account as verified
  await pool.query(
    `
    UPDATE users
    SET is_verified = 1,
        verification_code = NULL,
        verification_expiry = NULL
    WHERE user_id = ?
    `,
    [numericId]
  );

  console.log("verifyCode: verification successful for user_id:", numericId);

  return { success: true, message: "Account verified successfully" };
}

/* =======================================================
   DELETE ACCOUNT
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
