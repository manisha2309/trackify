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

router.put('/me/quiz', protect, async (req, res) => {
  try {
    const { careerMatch, matchPercentage } = req.body;
    if (typeof careerMatch !== 'string' || !careerMatch.trim() || careerMatch.length >= 80) {
      return res.status(400).json({ error: 'careerMatch must be a non-empty string under 80 characters' });
    }

    req.user.careerMatch = careerMatch.trim();
    req.user.careerMatchPct = typeof matchPercentage === 'number' ? matchPercentage : Number(matchPercentage) || 0;
    req.user.quizCompleted = true;
    await req.user.save();

    res.json(req.user.toPublic());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;