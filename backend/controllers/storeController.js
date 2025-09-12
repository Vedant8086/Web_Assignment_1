const { validationResult } = require('express-validator');
const pool = require('../config/database');

const getAllStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as overall_rating,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
      WHERE 1=1
    `;
    
    const params = [userId];
    let paramCount = 1;

    if (name) {
      paramCount++;
      query += ` AND s.name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
    }
    if (address) {
      paramCount++;
      query += ` AND s.address ILIKE $${paramCount}`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id, s.name, s.email, s.address, s.created_at, ur.rating`;
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const existingStore = await pool.query('SELECT * FROM stores WHERE email = $1', [email]);
    if (existingStore.rows.length > 0) {
      return res.status(400).json({ message: 'Store already exists' });
    }

    // Create store
    const newStore = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, ownerId]
    );

    res.status(201).json(newStore.rows[0]);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStoresByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
    `, [ownerId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get owner stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStoreRatings = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const ownerId = req.user.id;

    // Verify store ownership
    const storeCheck = await pool.query('SELECT * FROM stores WHERE id = $1 AND owner_id = $2', 
      [storeId, ownerId]);
    
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found or access denied' });
    }

    const result = await pool.query(`
      SELECT u.name, u.email, r.rating, r.created_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllStores,
  createStore,
  getStoresByOwner,
  getStoreRatings
};
