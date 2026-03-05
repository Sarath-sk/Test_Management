const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'manager', 'tester'], default: 'manager' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  clientName: { type: String, trim: true },
  status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
  color: { type: String, default: '#6366f1' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  tags: [{ type: String }]
}, { timestamps: true });

// Virtual: total test case count
projectSchema.virtual('testCaseCount', {
  ref: 'TestCase',
  localField: '_id',
  foreignField: 'project',
  count: true
});

module.exports = mongoose.model('Project', projectSchema);
