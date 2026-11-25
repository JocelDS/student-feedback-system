const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Slow down password guessing: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' }
});

function sameText(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const userOk = sameText(username, process.env.ADMIN_USERNAME);
    const passOk = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!userOk || !passOk) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { role: 'admin', username: process.env.ADMIN_USERNAME },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.status(200).json({ token, expiresIn: '2h' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me -> lets the frontend check that its token is still valid
router.get('/me', requireAdmin, (req, res) => {
  res.status(200).json({ username: req.admin.username, role: 'admin' });
});

module.exports = router;
