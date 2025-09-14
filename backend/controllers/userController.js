const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Register user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at',
      [name, email, hashedPassword, address || null, role]
    );

    const token = generateToken(newUser.rows[0].id);

    res.status(201).json({
      token,
      user: newUser.rows[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.rows[0].id);

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        address: user.rows[0].address,
        role: user.rows[0].role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { name, email, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    let query = `
      SELECT id, name, email, address, role, created_at, updated_at 
      FROM users 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (name) {
      query += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      query += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${email}%`);
      paramIndex++;
    }
    if (role) {
      query += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role, created_at',
      [name, email, hashedPassword, address || null, role]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATED: Allow users to update their personal details (name, email, address, password) but NOT role
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { name, email, address, password } = req.body;

    console.log('🔧 User updating profile:', userId);
    console.log('📝 Update data:', { name, email, address, password: !!password });

    // Check if email is being changed and already exists
    if (email && email.trim() !== '') {
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2', 
        [email.trim(), userId]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Prepare fields for update (users can update name, email, address, password but NOT role)
    const fieldsToUpdate = {};
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name && name.trim() !== '') {
      fieldsToUpdate.name = name.trim();
      updates.push(`name = $${paramIndex}`);
      values.push(name.trim());
      paramIndex++;
    }

    if (email && email.trim() !== '') {
      fieldsToUpdate.email = email.trim();
      updates.push(`email = $${paramIndex}`);
      values.push(email.trim());
      paramIndex++;
    }

    if (address !== undefined) {
      fieldsToUpdate.address = address ? address.trim() : null;
      updates.push(`address = $${paramIndex}`);
      values.push(address ? address.trim() : null);
      paramIndex++;
    }

    // Hash password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      fieldsToUpdate.password = hashedPassword;
      updates.push(`password = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Add userId and updated timestamp
    values.push(userId);
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, address, role, created_at, updated_at
    `;

    console.log('📝 Executing SQL:', sql);
    console.log('📝 With values:', values.map((v, i) => i === values.length - 1 ? v : (typeof v === 'string' && v.length > 50 ? '[HASHED]' : v)));

    const result = await pool.query(sql, values);
    
    console.log('✅ Profile updated successfully');
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
      const totalStores = await pool.query('SELECT COUNT(*) FROM stores');
      const totalRatings = await pool.query('SELECT COUNT(*) FROM ratings');
      const avgRating = await pool.query('SELECT AVG(rating) FROM ratings');

      stats = {
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalStores: parseInt(totalStores.rows[0].count),
        totalRatings: parseInt(totalRatings.rows[0].count),
        averageRating: parseFloat(avgRating.rows[0].avg || 0).toFixed(2)
      };
    } else if (userRole === 'store_owner') {
      // Store owner dashboard stats
      const myStores = await pool.query('SELECT COUNT(*) FROM stores WHERE owner_id = $1', [userId]);
      const myRatings = await pool.query('SELECT COUNT(*) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = $1', [userId]);
      const myAvgRating = await pool.query('SELECT AVG(rating) FROM ratings r JOIN stores s ON r.store_id = s.id WHERE s.owner_id = $1', [userId]);

      stats = {
        myStores: parseInt(myStores.rows[0].count),
        myRatings: parseInt(myRatings.rows[0].count),
        myAverageRating: parseFloat(myAvgRating.rows[0].avg || 0).toFixed(2)
      };
    } else {
      // Regular user stats
      const myRatings = await pool.query('SELECT COUNT(*) FROM ratings WHERE user_id = $1', [userId]);
      const myAvgRating = await pool.query('SELECT AVG(rating) FROM ratings WHERE user_id = $1', [userId]);

      stats = {
        myRatings: parseInt(myRatings.rows[0].count),
        myAverageRating: parseFloat(myAvgRating.rows[0].avg || 0).toFixed(2)
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  createUser,
  updateProfile,
  getDashboardStats
};
