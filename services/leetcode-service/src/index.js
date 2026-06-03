const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const leetcodeRoutes = require('./routes/leetcode');
const { syncAllUsers } = require('./utils/sync');

const app  = express();
const PORT = process.env.PORT || 4003;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpath-leetcode')
  .then(() => console.log('✅ LeetCode DB connected'))
  .catch(err => console.error('LeetCode DB error:', err));

app.use('/leetcode', leetcodeRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'leetcode' }));

cron.schedule('0 2 * * *', () => {
  console.log('🔄 Running daily LeetCode sync...');
  syncAllUsers();
});

app.listen(PORT, () => console.log(`📊 LeetCode Service on port ${PORT}`));