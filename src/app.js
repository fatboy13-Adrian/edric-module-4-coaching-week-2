// src/app.js - Main application file
const express = require("express");
const app = express();
const logger = require('./middleware/logger');
const { initDb, closeDb } = require('./db');
const itemRoutes = require('./routes/itemRoutes');

// Parse JSON body
app.use(express.json());

// Apply logging middleware
app.use(logger);

// Initialize database
initDb();

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// Mount routes
app.use('/api/items', itemRoutes);

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("Shutting down...");
  closeDb();
  process.exit(0);
});

module.exports = app; 