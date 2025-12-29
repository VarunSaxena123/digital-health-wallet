const { dbAsync } = require('../models/database');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');

/**
 * User Registration
 */
async function register(req, res, next) {
  try {
    const { username, email, password, full_name, date_of_birth } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await dbAsync.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const result = await dbAsync.run(
      `INSERT INTO users (username, email, password_hash, full_name, date_of_birth) 
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name || null, date_of_birth || null]
    );

    const userId = result.id;
    const token = generateToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, username, email, full_name }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * User Login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = await dbAsync.get(
      'SELECT id, username, email, full_name, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current user profile
 */
async function getProfile(req, res, next) {
  try {
    const user = await dbAsync.get(
      'SELECT id, username, email, full_name, date_of_birth, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { full_name, date_of_birth } = req.body;

    await dbAsync.run(
      `UPDATE users SET full_name = ?, date_of_birth = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [full_name || null, date_of_birth || null, req.userId]
    );

    const user = await dbAsync.get(
      'SELECT id, username, email, full_name, date_of_birth FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
