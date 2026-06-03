const LeetCodeStats = require('../models/LeetCodesStats');
const { fetchLeetCodeStats } = require('./fetcher');

async function syncAllUsers() {
  const users = await LeetCodeStats.find({}, 'username');
  for (const u of users) {
    const stats = await fetchLeetCodeStats(u.username);
    if (stats) {
      await LeetCodeStats.findOneAndUpdate({ username: u.username }, stats);
      console.log(`Synced: ${u.username}`);
    }
  }
}
module.exports = { syncAllUsers };