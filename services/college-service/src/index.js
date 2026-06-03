const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const collegeRoutes = require('./routes/colleges');
const app  = express();
const PORT = process.env.PORT || 4004;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpath-colleges')
  .then(() => console.log('✅ College DB connected'));
app.use('/colleges', collegeRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'college' }));
app.listen(PORT, () => console.log(`🏛️  College Service on port ${PORT}`));