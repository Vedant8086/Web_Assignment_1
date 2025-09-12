const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Add the missing getAllStores function
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

// Admin function to create stores with specified owner
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
    
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid Owner ID' });
    }
    
    res.status(500).json({ message: 'Server error while creating store' });
  }
};

// Store owners create their own stores
const createStoreForOwner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address } = req.body;
    const ownerId = req.user.id; // Use logged-in user's ID as owner

    // Check if store with same email exists
    const existingStore = await pool.query('SELECT * FROM stores WHERE email = $1', [email]);
    if (existingStore.rows.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    // Create store with current user as owner
    const newStore = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, ownerId]
    );

    res.status(201).json(newStore.rows[0]);
  } catch (error) {
    console.error('Create store error:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid owner ID' });
    }
    
    res.status(500).json({ message: 'Server error while creating store' });
  }
};

// Get stores owned by current user
const getStoresByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const result = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        s.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as total_ratings,
        COUNT(DISTINCT r.user_id) as unique_raters
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
      ORDER BY s.created_at DESC
    `, [ownerId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get owner stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get detailed ratings for a specific store
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

    // Get detailed ratings with user information
    const result = await pool.query(`
      SELECT 
        u.id as user_id,
        u.name as user_name, 
        u.email as user_email, 
        r.rating, 
        r.created_at,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.updated_at DESC
    `, [storeId]);

    // Get store info as well
    const storeInfo = storeCheck.rows[0];

    res.json({
      store: storeInfo,
      ratings: result.rows,
      summary: {
        totalRatings: result.rows.length,
        averageRating: result.rows.length > 0 
          ? (result.rows.reduce((sum, r) => sum + r.rating, 0) / result.rows.length).toFixed(1)
          : '0.0'
      }
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fix the module.exports - make sure all exported functions are defined above
module.exports = {
  getAllStores,           // Now properly defined
  createStore,           // For admin use
  createStoreForOwner,   // For store owners
  getStoresByOwner,      // Get owner's stores
  getStoreRatings        // Get ratings for a store
};
