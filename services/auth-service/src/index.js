const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexpath-auth')
  .then(() => console.log('Auth DB connected'))
  .catch(err => console.error('Auth DB error:', err));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth' }));

app.listen(PORT, () => console.log(`🔐 Auth Service on port ${PORT}`));