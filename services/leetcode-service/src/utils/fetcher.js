const axios = require('axios');
const mongoose = require('mongoose');

// Ensure Mongoose Map types serialize properly to JSON objects
try {
  mongoose.plugin((schema) => {
    schema.set('toObject', { flattenMaps: true });
    schema.set('toJSON', { flattenMaps: true });
  });
  if (mongoose.models && mongoose.models.LeetCodeStats) {
    mongoose.models.LeetCodeStats.schema.set('toObject', { flattenMaps: true });
    mongoose.models.LeetCodeStats.schema.set('toJSON', { flattenMaps: true });
  }
} catch (e) {}

if (!Map.prototype.toJSON) {
  Map.prototype.toJSON = function () {
    return Object.fromEntries(this);
  };
}

const LEETCODE_GQL = 'https://leetcode.com/graphql';

async function fetchLeetCodeStats(username) {
  try {
    const { data } = await axios.post(LEETCODE_GQL, {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile { ranking }
            userCalendar { streak totalActiveDays submissionCalendar }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty count
              }
            }
          }
          recentAcSubmissionList(username: $username, limit: 10) {
            title
            titleSlug
            timestamp
            lang
          }
          allQuestionsCount { difficulty count }
        }
      `,
      variables: { username }
    }, {
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      timeout: 15000
    });

    const user = data?.data?.matchedUser;
    if (!user) return null;

    const ac = user.submitStatsGlobal?.acSubmissionNum || [];
    const all = data?.data?.allQuestionsCount || [];

    const get = (arr, diff) => arr.find(x => x.difficulty === diff)?.count || 0;

    let streak = 0;
    let submissionCalendar = {};
    try {
      if (user.userCalendar) {
        streak = user.userCalendar.streak || 0;
        if (user.userCalendar.submissionCalendar) {
          submissionCalendar = typeof user.userCalendar.submissionCalendar === 'string'
            ? JSON.parse(user.userCalendar.submissionCalendar)
            : user.userCalendar.submissionCalendar;
        }
      }
    } catch (e) {
      console.warn('Calendar parse failed:', e.message);
    }

    let recentSubmissions = [];
    try {
      const list = data?.data?.recentAcSubmissionList || [];
      recentSubmissions = list.map(s => ({
        title: s.title,
        lang: s.lang,
        status: 'Accepted',
        timestamp: Number(s.timestamp),
      }));
    } catch (e) {
      console.warn('Recent submissions parse failed:', e.message);
    }

    return {
      totalSolved:   get(ac, 'All'),
      easySolved:    get(ac, 'Easy'),
      mediumSolved:  get(ac, 'Medium'),
      hardSolved:    get(ac, 'Hard'),
      totalEasy:     get(all, 'Easy'),
      totalMedium:   get(all, 'Medium'),
      totalHard:     get(all, 'Hard'),
      ranking:       user.profile?.ranking,
      streak,
      submissionCalendar,
      recentSubmissions,
    };
  } catch (err) {
    console.error('LeetCode fetch error:', err.message);
    return null;
  }
}

module.exports = { fetchLeetCodeStats };