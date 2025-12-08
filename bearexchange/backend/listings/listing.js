// backend/listings/listing.js

/**
 * Listing data access + business logic.
 * Uses the MySQL connection pool from db/db.js
 * to perform CRUD operations on the `listings` table.
 */

const pool = require("../db/db");

// ==============================
// Create a new listing
// ==============================
async function createListing({ userId, categoryId, title, description, price }) {
  const [result] = await pool.query(
    `
    INSERT INTO listings (user_id, category_id, title, description, price, status)
    VALUES (?, ?, ?, ?, ?, 'active')
    `,
    [userId, categoryId || null, title, description || null, price || null]
  );

  return { listingId: result.insertId };
}

// ==============================
// Get all listings (optionally filter by category or search term)
// ==============================
async function getAllListings({ categoryId, search }) {
  let sql = `
    SELECT l.listing_id, l.title, l.description, l.price, l.status, l.created_at,
           u.display_name AS seller_name,
           c.category_name
    FROM listings l
    JOIN users u ON l.user_id = u.user_id
    LEFT JOIN categories c ON l.category_id = c.category_id
    WHERE l.status = 'active'
  `;
  const params = [];

  if (categoryId) {
    sql += " AND l.category_id = ?";
    params.push(categoryId);
  }

  if (search) {
    sql += " AND (l.title LIKE ? OR l.description LIKE ?)";
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }

  sql += " ORDER BY l.created_at DESC";

  const [rows] = await pool.query(sql, params);
  return rows;
}

// ==============================
// Get single listing by ID
// ==============================
async function getListingById(listingId) {
  const [rows] = await pool.query(
    `
    SELECT l.listing_id, l.title, l.description, l.price, l.status, l.created_at,
           u.display_name AS seller_name, u.user_id AS seller_id,
           c.category_name
    FROM listings l
    JOIN users u ON l.user_id = u.user_id
    LEFT JOIN categories c ON l.category_id = c.category_id
    WHERE l.listing_id = ?
    `,
    [listingId]
  );

  if (rows.length === 0) {
    return null;
  }
  return rows[0];
}

// ==============================
// Update a listing (only by owner in future)
// ==============================
async function updateListing(listingId, { title, description, price, status, categoryId }) {
  // Build dynamic update
  const fields = [];
  const params = [];

  if (title !== undefined) {
    fields.push("title = ?");
    params.push(title);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    params.push(description);
  }
  if (price !== undefined) {
    fields.push("price = ?");
    params.push(price);
  }
  if (status !== undefined) {
    fields.push("status = ?");
    params.push(status);
  }
  if (categoryId !== undefined) {
    fields.push("category_id = ?");
    params.push(categoryId);
  }

  if (fields.length === 0) {
    return { affectedRows: 0 };
  }

  const sql = `
    UPDATE listings
    SET ${fields.join(", ")}
    WHERE listing_id = ?
  `;
  params.push(listingId);

  const [result] = await pool.query(sql, params);
  return { affectedRows: result.affectedRows };
}

// ==============================
// Delete listing (hard delete for now)
// ==============================
async function deleteListing(listingId) {
  const [result] = await pool.query(
    `DELETE FROM listings WHERE listing_id = ?`,
    [listingId]
  );
  return { affectedRows: result.affectedRows };
}

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
};
