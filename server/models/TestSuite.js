const mongoose = require('mongoose');

const testSuiteSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  parentSuite: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSuite', default: null },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('TestSuite', testSuiteSchema);
