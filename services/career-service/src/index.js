const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const quizRoutes   = require('./routes/quiz');
const careerRoutes = require('./routes/careers');
const app  = express();
const PORT = process.env.PORT || 4002;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpath-career')
  .then(() => console.log('✅ Career DB connected'));
app.use('/quiz',    quizRoutes);
app.use('/careers', careerRoutes);
app.get('/health',  (_, res) => res.json({ status: 'ok', service: 'career' }));
app.listen(PORT, () => console.log(`🎯 Career Service on port ${PORT}`));