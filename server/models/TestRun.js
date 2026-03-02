const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  testCase: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase', required: true },
  status: { type: String, enum: ['pass', 'fail', 'skip', 'blocked', 'untested'], default: 'untested' },
  notes: { type: String },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  executedAt: { type: Date },
  duration: { type: Number } // milliseconds
});

const testRunSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  suite: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSuite' },
  status: { type: String, enum: ['planned', 'in_progress', 'completed', 'aborted'], default: 'planned' },
  results: [resultSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

// Virtual stats
testRunSchema.virtual('stats').get(function () {
  const total = this.results.length;
  const pass = this.results.filter(r => r.status === 'pass').length;
  const fail = this.results.filter(r => r.status === 'fail').length;
  const skip = this.results.filter(r => r.status === 'skip').length;
  const blocked = this.results.filter(r => r.status === 'blocked').length;
  const untested = this.results.filter(r => r.status === 'untested').length;
  return { total, pass, fail, skip, blocked, untested, passRate: total ? Math.round((pass / total) * 100) : 0 };
});

testRunSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TestRun', testRunSchema);
