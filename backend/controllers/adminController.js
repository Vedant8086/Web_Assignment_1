const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Helper function to build dynamic SQL SET clause
const buildUpdateQuery = (fields, allowedFields) => {
  const updates = [];
  const values = [];
  let paramIndex = 1;

  allowedFields.forEach(field => {
    if (fields[field] !== undefined) {
      updates.push(`${field} = $${paramIndex}`);
      values.push(fields[field]);
      paramIndex++;
    }
  });

  return { updates, values, paramIndex };
};

// Admin: Update any user
const updateUser = async (req, res) => {
  try {
    console.log('🔧 Admin updateUser called for ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { name, email, address, role, password } = req.body;

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare fields for update
    const fieldsToUpdate = {};
    if (name && name.trim() !== '') fieldsToUpdate.name = name.trim();
    if (email && email.trim() !== '') fieldsToUpdate.email = email.trim();
    if (address !== undefined) fieldsToUpdate.address = address.trim() || null;
    if (role && role.trim() !== '') fieldsToUpdate.role = role.trim();

    // Hash password if provided
    if (password && password.trim() !== '') {
      fieldsToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }

    const allowedFields = ['name', 'email', 'address', 'role', 'password'];
    const { updates, values, paramIndex } = buildUpdateQuery(fieldsToUpdate, allowedFields);

    if (updates.length === 0) {
      console.log('❌ No valid fields to update');
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Add userId
    values.push(userId);
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, address, role, created_at, updated_at
    `;

    console.log('📝 Executing SQL:', sql);
    console.log('📝 With values:', values);

    const result = await pool.query(sql, values);
    
    console.log('✅ User updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Admin updateUser error:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Admin: Update any store
const updateStore = async (req, res) => {
  try {
    console.log('🔧 Admin updateStore called for ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const storeId = req.params.id;
    const { name, email, address, owner_id } = req.body;

    // Check if store exists
    const storeCheck = await pool.query('SELECT * FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      console.log('❌ Store not found:', storeId);
      return res.status(404).json({ message: 'Store not found' });
    }

    // Prepare fields for update
    const fieldsToUpdate = {};
    if (name && name.trim() !== '') fieldsToUpdate.name = name.trim();
    if (email && email.trim() !== '') fieldsToUpdate.email = email.trim();
    if (address !== undefined) fieldsToUpdate.address = address.trim() || null;
    if (owner_id) fieldsToUpdate.owner_id = parseInt(owner_id);

    const allowedFields = ['name', 'email', 'address', 'owner_id'];
    const { updates, values, paramIndex } = buildUpdateQuery(fieldsToUpdate, allowedFields);

    if (updates.length === 0) {
      console.log('❌ No valid fields to update');
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Add storeId
    values.push(storeId);
    const sql = `
      UPDATE stores 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramIndex} 
      RETURNING id, name, email, address, owner_id, created_at, updated_at
    `;

    console.log('📝 Executing SQL:', sql);
    console.log('📝 With values:', values);

    const result = await pool.query(sql, values);
    
    console.log('✅ Store updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Admin updateStore error:', error);
    res.status(500).json({ message: 'Server error while updating store' });
  }
};

// Admin: Delete User (FIXED VERSION)
const deleteUser = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    console.log('🗑️  Admin deleteUser called for ID:', id);

    if (!id || isNaN(parseInt(id))) {
      console.log('❌ Invalid user ID:', id);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if user exists
    const userCheck = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      console.log('❌ User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userCheck.rows[0];
    console.log('👤 Found user to delete:', user.name, user.email);

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      console.log('❌ Admin trying to delete themselves');
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Start transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction started');

    try {
      // Step 1: Delete all ratings made BY this user
      const userRatingsResult = await client.query(
        'DELETE FROM ratings WHERE user_id = $1', 
        [id]
      );
      console.log('📊 Deleted ratings BY user:', userRatingsResult.rowCount);

      // Step 2: If user is a store owner, handle their stores
      if (user.role === 'store_owner') {
        console.log('🏪 User is store owner, handling owned stores...');
        
        // Get all stores owned by this user
        const ownedStoresResult = await client.query(
          'SELECT id, name FROM stores WHERE owner_id = $1', 
          [id]
        );
        
        console.log('🏪 Found owned stores:', ownedStoresResult.rows.length);

        if (ownedStoresResult.rows.length > 0) {
          const storeIds = ownedStoresResult.rows.map(store => store.id);
          console.log('🏪 Store IDs to clean up:', storeIds);
          
          // Delete ratings FOR stores owned by this user
          const storeRatingsResult = await client.query(
            'DELETE FROM ratings WHERE store_id = ANY($1)', 
            [storeIds]
          );
          console.log('📊 Deleted ratings FOR owned stores:', storeRatingsResult.rowCount);
          
          // Delete the stores owned by this user
          const deleteStoresResult = await client.query(
            'DELETE FROM stores WHERE owner_id = $1', 
            [id]
          );
          console.log('🏪 Deleted owned stores:', deleteStoresResult.rowCount);
        }
      }

      // Step 3: Finally delete the user
      const deleteUserResult = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role', 
        [id]
      );
      console.log('👤 User deletion result:', deleteUserResult.rowCount);

      if (deleteUserResult.rowCount === 0) {
        console.log('❌ User not found during final deletion');
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found during deletion' });
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transaction committed - user deleted successfully');

      const deletedUser = deleteUserResult.rows[0];

      res.json({ 
        message: 'User deleted successfully', 
        deletedUser: {
          id: deletedUser.id,
          name: deletedUser.name,
          email: deletedUser.email,
          role: deletedUser.role
        },
        summary: {
          userRatingsDeleted: userRatingsResult.rowCount,
          storesDeleted: user.role === 'store_owner' ? 'N/A' : 0,
          storeRatingsDeleted: user.role === 'store_owner' ? 'N/A' : 0
        }
      });

    } catch (transactionError) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.error('❌ Transaction error, rolled back:', transactionError);
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ Delete user error:', error);
    
    // Handle specific database errors
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Cannot delete user due to foreign key constraints. Please contact support.',
        details: 'User has associated data that prevents deletion'
      });
    }
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        message: 'Database constraint violation during deletion'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
    
  } finally {
    // Always release the client back to the pool
    client.release();
    console.log('🔌 Database connection released');
  }
};

// Admin: Delete Store (FIXED VERSION)
const deleteStore = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    console.log('🗑️  Admin deleteStore called for ID:', id);

    if (!id || isNaN(parseInt(id))) {
      console.log('❌ Invalid store ID:', id);
      return res.status(400).json({ message: 'Invalid store ID' });
    }

    // Check if store exists
    const storeCheck = await client.query('SELECT * FROM stores WHERE id = $1', [id]);
    if (storeCheck.rows.length === 0) {
      console.log('❌ Store not found:', id);
      return res.status(404).json({ message: 'Store not found' });
    }

    const store = storeCheck.rows[0];
    console.log('🏪 Found store to delete:', store.name, store.email);

    // Start transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction started');

    try {
      // Step 1: Delete all ratings for this store
      const ratingsResult = await client.query(
        'DELETE FROM ratings WHERE store_id = $1', 
        [id]
      );
      console.log('📊 Deleted store ratings:', ratingsResult.rowCount);

      // Step 2: Delete the store
      const deleteStoreResult = await client.query(
        'DELETE FROM stores WHERE id = $1 RETURNING id, name, email', 
        [id]
      );
      console.log('🏪 Store deletion result:', deleteStoreResult.rowCount);

      if (deleteStoreResult.rowCount === 0) {
        console.log('❌ Store not found during final deletion');
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Store not found during deletion' });
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Transaction committed - store deleted successfully');

      const deletedStore = deleteStoreResult.rows[0];

      res.json({ 
        message: 'Store deleted successfully', 
        deletedStore: {
          id: deletedStore.id,
          name: deletedStore.name,
          email: deletedStore.email
        },
        summary: {
          ratingsDeleted: ratingsResult.rowCount
        }
      });

    } catch (transactionError) {
      // Rollback transaction on any error
      await client.query('ROLLBACK');
      console.error('❌ Store deletion transaction error, rolled back:', transactionError);
      throw transactionError;
    }

  } catch (error) {
    console.error('❌ Delete store error:', error);
    
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Cannot delete store due to foreign key constraints.'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while deleting store',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
    
  } finally {
    // Always release the client back to the pool
    client.release();
    console.log('🔌 Database connection released');
  }
};

// CRITICAL: Export all functions
module.exports = {
  updateUser,
  updateStore,
  deleteUser,
  deleteStore
};

// Debug logging
console.log('📦 Admin Controller - Exporting functions:');
console.log('updateUser:', typeof updateUser);
console.log('updateStore:', typeof updateStore);
console.log('deleteUser:', typeof deleteUser);
console.log('deleteStore:', typeof deleteStore);
