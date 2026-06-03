const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const roadmapRoutes = require('./routes/roadmaps');
const app  = express();
const PORT = process.env.PORT || 4005;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpath-roadmaps')
  .then(() => console.log('✅ Roadmap DB connected'));
app.use('/roadmaps', roadmapRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'roadmap' }));
app.listen(PORT, () => console.log(`🗺️  Roadmap Service on port ${PORT}`));