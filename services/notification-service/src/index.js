const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 4006;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// POST /notify/email
app.post('/notify/email', async (req, res) => {
  const { to, subject, body } = req.body;
  // TODO: integrate Nodemailer with SMTP config
  console.log(`📧 Email to ${to}: ${subject}`);
  res.json({ success: true, message: 'Email queued' });
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'notification' }));

app.listen(PORT, () => console.log(`📬 Notification Service on port ${PORT}`));