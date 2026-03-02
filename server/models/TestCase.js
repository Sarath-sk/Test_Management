const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  stepNo: { type: Number, required: true },
  action: { type: String, required: true },
  expectedResult: { type: String, required: true },
  testData: { type: String }
}, { _id: false });

const testCaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  preconditions: { type: String },
  steps: [stepSchema],
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['draft', 'active', 'deprecated'], default: 'draft' },
  type: { type: String, enum: ['functional', 'regression', 'smoke', 'integration', 'performance', 'security'], default: 'functional' },
  suite: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSuite', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: [{ type: String }],
  estimatedTime: { type: Number }, // in minutes
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastExecutedAt: { type: Date },
  lastExecutionStatus: { type: String, enum: ['pass', 'fail', 'skip', 'blocked', null], default: null }
}, { timestamps: true });

testCaseSchema.index({ project: 1, suite: 1 });
testCaseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('TestCase', testCaseSchema);
