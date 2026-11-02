// const router = require('express').Router();
// const jwt = require('jsonwebtoken');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');

// const signAccess  = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
// const signRefresh = id => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// // POST /auth/register
// router.post('/register', [
//   body('name').notEmpty().trim(),
//   body('email').isEmail().normalizeEmail(),
//   body('password').isLength({ min: 6 }),
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const { name, email, password } = req.body;
//     const exists = await User.findOne({ email });
//     if (exists) return res.status(409).json({ error: 'Email already registered' });

//     const user = await User.create({ name, email, password });
//     const accessToken  = signAccess(user._id);
//     const refreshToken = signRefresh(user._id);
//     user.refreshTokens.push(refreshToken);
//     await user.save();

//     res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 3600 * 1000 });
//     res.status(201).json({ user: user.toPublic(), accessToken });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /auth/login
// router.post('/login', [
//   body('email').isEmail(),
//   body('password').notEmpty(),
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await user.comparePassword(password)))
//       return res.status(401).json({ error: 'Invalid credentials' });

//     const accessToken  = signAccess(user._id);
//     const refreshToken = signRefresh(user._id);
//     user.refreshTokens.push(refreshToken);
//     await user.save();

//     res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 3600 * 1000 });
//     res.json({ user: user.toPublic(), accessToken });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST /auth/refresh
// router.post('/refresh', async (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (!token) return res.status(401).json({ error: 'No refresh token' });
//   try {
//     const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(id);
//     if (!user || !user.refreshTokens.includes(token))
//       return res.status(401).json({ error: 'Invalid refresh token' });

//     const accessToken = signAccess(id);
//     res.json({ accessToken });
//   } catch {
//     res.status(401).json({ error: 'Expired refresh token' });
//   }
// });

// // POST /auth/logout
// router.post('/logout', async (req, res) => {
//   const token = req.cookies.refreshToken;
//   if (token) {
//     const { id } = jwt.decode(token) || {};
//     if (id) {
//       const user = await User.findById(id);
//       if (user) { user.refreshTokens = user.refreshTokens.filter(t => t !== token); await user.save(); }
//     }
//   }
//   res.clearCookie('refreshToken');
//   res.json({ message: 'Logged out' });
// });

// module.exports = router;

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const signAccess  = id => jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: '15m' });
const signRefresh = id => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET,  { expiresIn: '7d'  });

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'lax' : 'strict',
  maxAge: 7 * 24 * 3600 * 1000,
};

// POST /auth/register
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.status(201).json({ user: user.toPublic(), accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    res.json({ user: user.toPublic(), accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const { id } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(id);
    if (!user || !user.refreshTokens.includes(token))
      return res.status(401).json({ error: 'Invalid refresh token' });

    res.json({ accessToken: signAccess(id) });
  } catch {
    res.status(401).json({ error: 'Expired refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    }
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;