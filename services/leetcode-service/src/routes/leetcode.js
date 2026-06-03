const router = require('express').Router();
const { fetchLeetCodeStats } = require('../utils/fetcher');
const LeetCodeStats = require('../models/LeetCodesStats');

// GET /leetcode/:username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    if (req.query.refresh !== 'true') {
      const cached = await LeetCodeStats.findOne({ username });
      if (cached) {
        const ageHours = (Date.now() - new Date(cached.updatedAt)) / 3600000;
        if (ageHours < 24) return res.json({ ...cached.toObject(), fromCache: true });
      }
    }
    const stats = await fetchLeetCodeStats(username);
    if (!stats) return res.status(404).json({ error: 'LeetCode user not found' });
    const updated = await LeetCodeStats.findOneAndUpdate(
      { username }, { ...stats, username }, { upsert: true, new: true }
    );
    res.json({ ...updated.toObject(), fromCache: false });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /leetcode/:username/heatmap
router.get('/:username/heatmap', async (req, res) => {
  try {
    const cached = await LeetCodeStats.findOne({ username: req.params.username });
    if (!cached) return res.status(404).json({ error: 'No data. Sync first.' });
    res.json({ heatmap: cached.submissionCalendar });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;