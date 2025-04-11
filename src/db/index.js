const { Pool } = require("pg");

// Create a PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Initialize database
async function initDb() {
  const client = await pool.connect();
  try {
    // Create a simple table
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    client.release();
  }
}

// Clean up resources
function closeDb() {
  return pool.end();
}

module.exports = {
  pool,
  initDb,
  closeDb
}; 