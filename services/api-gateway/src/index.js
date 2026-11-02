// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const proxy = require('express-http-proxy');
// const { verifyToken } = require('./middleware/auth');
// require('dotenv').config();
// require('dotenv').config({ path: '../.env' })

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(helmet());
// app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
// app.use(morgan('combined'));
// app.use(express.json());

// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
// app.use('/api/', limiter);
// app.use('/api/auth/', authLimiter);

// const SERVICES = {
//   auth:     process.env.AUTH_SERVICE_URL     || 'http://auth-service:4001',
//   career:   process.env.CAREER_SERVICE_URL   || 'http://career-service:4002',
//   leetcode: process.env.LEETCODE_SERVICE_URL || 'http://leetcode-service:4003',
//   college:  process.env.COLLEGE_SERVICE_URL  || 'http://college-service:4004',
//   roadmap:  process.env.ROADMAP_SERVICE_URL  || 'http://roadmap-service:4005',
//   notify:   process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4006',
// };

// app.use('/api/auth', proxy(SERVICES.auth, {
//   proxyReqPathResolver: req => '/auth' + req.url
// }));

// app.use('/api/colleges', proxy(SERVICES.college, {
//   proxyReqPathResolver: req => '/colleges' + req.url
// }));

// app.use('/api/career/quiz', proxy(SERVICES.career, {
//   proxyReqPathResolver: req => '/quiz' + req.url
// }));

// app.use('/api/career', verifyToken, proxy(SERVICES.career, {
//   proxyReqPathResolver: req => '/career' + req.url
// }));

// app.use('/api/leetcode', verifyToken, proxy(SERVICES.leetcode, {
//   proxyReqPathResolver: req => '/leetcode' + req.url
// }));

// // app.use('/api/roadmap', verifyToken, proxy(SERVICES.roadmap, {
// //   proxyReqPathResolver: req => '/roadmaps' + req.url
// // }));

// app.use('/api/roadmap', (req, res, next) => {
//   console.log('🗺️ Roadmap hit:', req.method, req.url);
//   console.log('🔑 Auth header:', req.headers.authorization ? 'present' : 'MISSING');
//   console.log('🎯 Forwarding to:', SERVICES.roadmap);
//   next();
// }, verifyToken, proxy(SERVICES.roadmap, {
//   proxyReqPathResolver: req => {
//     console.log('📍 Path resolver:', '/roadmaps' + req.url);
//     return '/roadmaps' + req.url;
//   },
//   proxyErrorHandler: (err, res, next) => {
//     console.error('❌ Proxy error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// }));

// app.use('/api/notify', verifyToken, proxy(SERVICES.notify, {
//   proxyReqPathResolver: req => '/notify' + req.url
// }));

// app.get('/health', (_, res) => res.json({ status: 'ok', gateway: true }));

// app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const proxy = require('express-http-proxy');
const { verifyToken } = require('./middleware/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('combined'));

//app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

const SERVICES = {
  auth:     process.env.AUTH_SERVICE_URL     || 'http://auth-service:4001',
  career:   process.env.CAREER_SERVICE_URL   || 'http://career-service:4002',
  leetcode: process.env.LEETCODE_SERVICE_URL || 'http://leetcode-service:4003',
  college:  process.env.COLLEGE_SERVICE_URL  || 'http://college-service:4004',
  roadmap:  process.env.ROADMAP_SERVICE_URL  || 'http://roadmap-service:4005',
  notify:   process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4006',
};

app.use('/api/auth', proxy(SERVICES.auth, {
  //parseReqBody: false,
  proxyReqPathResolver: req => '/auth' + req.url
}));

app.use('/api/profile', verifyToken, proxy(SERVICES.auth, { proxyReqPathResolver: req => '/profile' + req.url }));

app.use('/api/colleges', proxy(SERVICES.college, {
  parseReqBody: false,
  proxyReqPathResolver: req => '/colleges' + req.url
}));

app.use('/api/career/quiz', proxy(SERVICES.career, {
  parseReqBody: false,
  proxyReqPathResolver: req => '/quiz' + req.url
}));

app.use('/api/career', verifyToken, proxy(SERVICES.career, {
  parseReqBody: false,
  proxyReqPathResolver: req => '/career' + req.url
}));

app.use('/api/leetcode', verifyToken, proxy(SERVICES.leetcode, {
  parseReqBody: false,
  proxyReqPathResolver: req => '/leetcode' + req.url
}));

app.use('/api/roadmap', verifyToken, proxy(SERVICES.roadmap, {
  //parseReqBody: false,
  proxyReqPathResolver: req => '/roadmaps' + req.url
}));

app.use('/api/notify', verifyToken, proxy(SERVICES.notify, {
  parseReqBody: false,
  proxyReqPathResolver: req => '/notify' + req.url
}));




app.get('/health', (_, res) => res.json({ status: 'ok', gateway: true }));

app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));