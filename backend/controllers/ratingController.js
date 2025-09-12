const { validationResult } = require('express-validator');
const pool = require('../config/database');

const submitRating = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const storeCheck = await pool.query('SELECT * FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Insert or update rating
    const result = await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating) 
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, storeId, rating]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT r.*, s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitRating,
  getUserRatings
};
