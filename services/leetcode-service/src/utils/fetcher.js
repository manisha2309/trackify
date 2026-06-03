// const axios = require('axios');

// async function fetchLeetCodeStats(username) {
//   try {
//     const query = `
//       query getUserProfile($username: String!) {
//         matchedUser(username: $username) {
//           submitStats {
//             acSubmissionNum { difficulty count }
//           }
//           profile { ranking }
//           userCalendar(year: ${new Date().getFullYear()}) {
//             submissionCalendar
//             streak
//           }
//         }
//         allQuestionsCount { difficulty count }
//         recentAcSubmissionList(username: $username, limit: 10) {
//           title
//           lang
//           timestamp
//         }
//       }
//     `;

//     const { data } = await axios.post(
//       'https://leetcode.com/graphql',
//       { query, variables: { username } },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Referer':      'https://leetcode.com',
//           'Origin':       'https://leetcode.com',
//           'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
//           'x-csrftoken':  'dummy',
//           'Cookie':       'csrftoken=dummy',
//         },
//         timeout: 15000,
//       }
//     );

//     if (data.errors) {
//       console.error('GraphQL errors:', JSON.stringify(data.errors));
//       return null;
//     }

//     const user = data?.data?.matchedUser;
//     if (!user) {
//       console.error('User not found:', JSON.stringify(data));
//       return null;
//     }

//     const ac = user.submitStats.acSubmissionNum;
//     const getCount = (diff) => ac.find(x => x.difficulty === diff)?.count || 0;
//     const allQ = data.data.allQuestionsCount;
//     const getTotal = (diff) => allQ.find(x => x.difficulty === diff)?.count || 0;

//     return {
//       totalSolved:        getCount('All'),
//       easySolved:         getCount('Easy'),
//       mediumSolved:       getCount('Medium'),
//       hardSolved:         getCount('Hard'),
//       totalEasy:          getTotal('Easy'),
//       totalMedium:        getTotal('Medium'),
//       totalHard:          getTotal('Hard'),
//       ranking:            user.profile.ranking,
//       streak:             user.userCalendar?.streak || 0,
//       submissionCalendar: JSON.parse(user.userCalendar?.submissionCalendar || '{}'),
//       recentSubmissions:  (data.data.recentAcSubmissionList || []).map(s => ({
//         title:  s.title,
//         lang:   s.lang,
//         status: 'Accepted',
//       })),
//     };
//   } catch (err) {
//     console.error('LeetCode fetch error:', err.message);
//     if (err.response) {
//       console.error('Response status:', err.response.status);
//       console.error('Response data:', JSON.stringify(err.response.data));
//     }
//     return null;
//   }
// }

// // module.exports = { fetchLeetCodeStats };

// const axios = require('axios');

// async function fetchLeetCodeStats(username) {
//   try {
//     // API 1 — core stats (reliable, no blocking)
//     const { data: stats } = await axios.get(
//       `https://leetcode-stats-api.herokuapp.com/${username}`,
//       { timeout: 10000 }
//     );
//     if (stats.status === 'error') return null;

//     // API 2 — heatmap + streak (alfa-leetcode-api)
//     let submissionCalendar = {};
//     let streak = 0;
//     let recentSubmissions = [];
//     try {
//       const { data: alfa } = await axios.get(
//         `https://alfa-leetcode-api.onrender.com/${username}/calendar`,
//         { timeout: 60000 }
//       );
//       submissionCalendar = JSON.parse(alfa?.submissionCalendar || '{}');
//       streak = alfa?.streak || 0;
//     } catch {
//       console.warn('Heatmap fetch failed, skipping...');
//     }

//     // API 3 — recent submissions
//     try {
//       const { data: recent } = await axios.get(
//         `https://alfa-leetcode-api.onrender.com/${username}/submission?limit=10`,
//         { timeout: 60000 }
//       );
//       recentSubmissions = (recent?.submission || []).map(s => ({
//         title:  s.title,
//         lang:   s.lang,
//         status: s.statusDisplay,
//       }));
//     } catch {
//       console.warn('Recent submissions fetch failed, skipping...');
//     }

//     return {
//       totalSolved:        stats.totalSolved,
//       easySolved:         stats.easySolved,
//       mediumSolved:       stats.mediumSolved,
//       hardSolved:         stats.hardSolved,
//       totalEasy:          stats.totalEasy,
//       totalMedium:        stats.totalMedium,
//       totalHard:          stats.totalHard,
//       ranking:            stats.ranking,
//       streak,
//       submissionCalendar,
//       recentSubmissions,
//     };
//   } catch (err) {
//     console.error('LeetCode fetch error:', err.message);
//     return null;
//   }
// }

// module.exports = { fetchLeetCodeStats };



const axios = require('axios');

const LEETCODE_GQL = 'https://leetcode.com/graphql';

async function fetchLeetCodeStats(username) {
  try {
    const { data } = await axios.post(LEETCODE_GQL, {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile { ranking }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty count
              }
            }
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

    const ac = user.submitStatsGlobal.acSubmissionNum;
    const all = data.data.allQuestionsCount;

    const get = (arr, diff) => arr.find(x => x.difficulty === diff)?.count || 0

    return {
      totalSolved:   get(ac, 'All'),
      easySolved:    get(ac, 'Easy'),
      mediumSolved:  get(ac, 'Medium'),
      hardSolved:    get(ac, 'Hard'),
      totalEasy:     get(all, 'Easy'),
      totalMedium:   get(all, 'Medium'),
      totalHard:     get(all, 'Hard'),
      ranking:       user.profile.ranking,
      streak:        0,
      submissionCalendar: {},
      recentSubmissions:  [],
    };
  } catch (err) {
    console.error('LeetCode fetch error:', err.message);
    return null;
  }
}

module.exports = { fetchLeetCodeStats };