const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  username:           { type: String, required: true, unique: true },
  totalSolved:        { type: Number, default: 0 },
  easySolved:         { type: Number, default: 0 },
  mediumSolved:       { type: Number, default: 0 },
  hardSolved:         { type: Number, default: 0 },
  ranking:            { type: Number, default: 0 },
  streak:             { type: Number, default: 0 },
  submissionCalendar: { type: Map, of: Number, default: {} },
  recentSubmissions:  [{ title: String, lang: String, status: String, timestamp: Number }],
}, { timestamps: true });

module.exports = mongoose.model('LeetCodeStats', schema);