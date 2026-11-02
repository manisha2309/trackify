const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  avatar:       { type: String, default: '' },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  plan:         { type: String, enum: ['free', 'pro', 'elite'], default: 'free' },
  language:     { type: String, default: 'en' },
  leetcodeUsername: { type: String, default: '' },
  quizCompleted: { type: Boolean, default: false },
  careerMatch:  { type: String, default: '' },
  careerMatchPct: { type: Number, default: 0 },
  refreshTokens: [String],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);