const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(404).json({ error: 'User not found' });
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

router.get('/me', protect, (req, res) => res.json(req.user.toPublic()));

router.put('/me', protect, async (req, res) => {
  const allowed = ['name', 'language', 'leetcodeUsername', 'avatar'];
  allowed.forEach(f => { if (req.body[f] !== undefined) req.user[f] = req.body[f]; });
  await req.user.save();
  res.json(req.user.toPublic());
});

module.exports = router;