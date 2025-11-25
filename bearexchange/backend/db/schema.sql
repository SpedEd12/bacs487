/*
=========================================================
DATABASE CREATION SCRIPT (bearexchange)
=========================================================

Purpose:
- Defines the MySQL database schema for the BearExchange student marketplace.
- Provides core backend tables for user accounts, listings, images, messaging,
  categories, ratings, and item reports.
- Ensures relational integrity through foreign keys and cascading behaviors.

Tables:
1. USERS — authenticated UNC student accounts
2. CATEGORIES — listing categories (furniture, books, electronics, etc.)
3. LISTINGS — items posted for sale by users
4. IMAGES — photos associated with listings
5. MESSAGES — buyer/seller communication on listings
6. RATINGS — user-to-user rating scores and comments
7. REPORTS — reported listings for moderation

Notes:
- Uses InnoDB for full relational integrity.
- Designed for use with a Node.js + Express backend and MySQL database.
- Built to support BearExchange MVP features (login, browse, search, messaging).
*/


-- Create database
CREATE DATABASE IF NOT EXISTS bearexchange;
USE bearexchange;

-- ============================
-- USERS
-- ============================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    unc_email VARCHAR(255) UNIQUE NOT NULL,           -- acts as username
    password_hash VARCHAR(255) NOT NULL,              -- bcrypt hash
    display_name VARCHAR(100),                        -- shown on listings/profile
    user_role ENUM('student', 'faculty', 'admin') DEFAULT 'student',
    is_verified BOOLEAN DEFAULT 0,                    -- email verified?
    verification_code VARCHAR(10),                    -- 6-digit code or similar
    verification_expiry DATETIME,                     -- when code expires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);


-- ============================
-- CATEGORIES
-- ============================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- ============================
-- LISTINGS
-- ============================
CREATE TABLE listings (
    listing_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    status ENUM('active', 'sold', 'removed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_listing_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_listing_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE SET NULL
);

-- ============================
-- IMAGES
-- ============================
CREATE TABLE images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,

    CONSTRAINT fk_image_listing
        FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
        ON DELETE CASCADE
);

-- ============================
-- MESSAGES
-- ============================
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    listing_id INT,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_message_listing
        FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
        ON DELETE SET NULL
);

-- ============================
-- RATINGS
-- ============================
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    rated_user_id INT NOT NULL,
    rater_user_id INT NOT NULL,
    score INT CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rating_rated_user
        FOREIGN KEY (rated_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_rating_rater_user
        FOREIGN KEY (rater_user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ============================
-- REPORTS
-- ============================
CREATE TABLE reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_listing
        FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
        ON DELETE CASCADE
);
