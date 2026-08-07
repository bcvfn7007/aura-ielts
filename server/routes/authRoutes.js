const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, target_band } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const band = target_band ? parseFloat(target_band) : 7.5;
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(full_name)}`;

    const result = await run(
      `INSERT INTO users (email, password_hash, full_name, target_band, avatar_url)
       VALUES (?, ?, ?, ?, ?)`,
      [email.toLowerCase().trim(), password_hash, full_name.trim(), band, avatar]
    );

    const user = {
      id: result.lastID,
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      target_band: band,
      avatar_url: avatar
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      target_band: user.target_band,
      avatar_url: user.avatar_url
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, email, full_name, target_band, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Update Profile (Full Name & Target Band)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { full_name, target_band } = req.body;
    const userId = req.user.id;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required.' });
    }

    const band = target_band ? parseFloat(target_band) : 7.5;

    await run(
      'UPDATE users SET full_name = ?, target_band = ? WHERE id = ?',
      [full_name.trim(), band, userId]
    );

    const updatedUser = await get(
      'SELECT id, email, full_name, target_band, avatar_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Change Password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const user = await get('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const new_hash = await bcrypt.hash(new_password, salt);

    await run('UPDATE users SET password_hash = ? WHERE id = ?', [new_hash, userId]);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
