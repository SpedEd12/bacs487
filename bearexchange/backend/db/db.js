// backend/db/db.js

// Import the mysql2 library (promise-based API)
const mysql = require("mysql2/promise");

// Create a connection pool to the bearexchange database
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "NewPasswordHere", 
  database: "bearexchange",
  connectionLimit: 10
});

// Export the pool so other files (like account.js) can use it
module.exports = pool;
