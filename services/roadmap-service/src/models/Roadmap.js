const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  resources: [{ type: String }],
  completed: { type: Boolean, default: false }
}, { _id: false });

const phaseSchema = new mongoose.Schema({
  phase: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: String, default: '' },
  steps: [stepSchema]
}, { _id: false });

const roadmapSchema = new mongoose.Schema({
  userId: { type: String, default: 'anon' },
  career: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedMonths: { type: Number, default: 12 },
  phases: [phaseSchema],
  progress: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

roadmapSchema.index({ userId: 1 });

module.exports = mongoose.model('Roadmap', roadmapSchema);
