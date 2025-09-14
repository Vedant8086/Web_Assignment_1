const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Submit or update rating
const submitRating = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { storeId, rating } = req.body;
    const userId = req.user.id;

    console.log('🌟 Rating submission:', { userId, storeId, rating });

    // Check if store exists
    const storeExists = await pool.query('SELECT id, name FROM stores WHERE id = $1', [storeId]);
    if (storeExists.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2', 
      [userId, storeId]
    );

    let result;
    if (existingRating.rows.length > 0) {
      // Update existing rating
      result = await pool.query(
        'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3 RETURNING *',
        [rating, userId, storeId]
      );
      console.log('✅ Rating updated');
    } else {
      // Create new rating
      result = await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *',
        [userId, storeId, rating]
      );
      console.log('✅ New rating created');
    }

    // Get updated store average
    const avgResult = await pool.query(
      'SELECT AVG(rating) as average FROM ratings WHERE store_id = $1',
      [storeId]
    );

    res.json({
      rating: result.rows[0],
      storeAverage: parseFloat(avgResult.rows[0].average || 0).toFixed(1),
      message: existingRating.rows.length > 0 ? 'Rating updated successfully' : 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('❌ Submit rating error:', error);
    res.status(500).json({ message: 'Server error while submitting rating' });
  }
};

// FIXED: Get user's ratings with better error handling
const getUserRatings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      console.log('❌ No user ID in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('📊 Fetching ratings for user:', userId);

    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        s.id as store_id,
        s.name as store_name,
        s.email as store_email,
        s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.updated_at DESC
    `, [userId]);

    console.log('📊 Found ratings:', result.rows.length);
    
    res.json({
      success: true,
      count: result.rows.length,
      ratings: result.rows
    });
  } catch (error) {
    console.error('❌ Get user ratings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching ratings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all ratings (admin only)
const getAllRatings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        s.id as store_id,
        s.name as store_name,
        s.email as store_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.updated_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      ratings: result.rows
    });
  } catch (error) {
    console.error('❌ Get all ratings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching ratings' 
    });
  }
};

// Delete rating
const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if rating exists
    const ratingCheck = await pool.query('SELECT * FROM ratings WHERE id = $1', [id]);
    if (ratingCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const rating = ratingCheck.rows[0];

    // Check permissions - user can delete own ratings, admin can delete any
    if (userRole !== 'admin' && rating.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    await pool.query('DELETE FROM ratings WHERE id = $1', [id]);
    
    res.json({ 
      success: true,
      message: 'Rating deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete rating error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting rating' 
    });
  }
};

module.exports = {
  submitRating,
  getUserRatings,
  getAllRatings,
  deleteRating
};
