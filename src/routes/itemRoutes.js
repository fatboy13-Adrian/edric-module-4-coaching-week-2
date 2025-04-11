const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get all items
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create a new item
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO items (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete an item
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted", item: result.rows[0] });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router; 