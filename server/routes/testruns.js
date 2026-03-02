const express = require('express');
const router = express.Router();
const TestRun = require('../models/TestRun');
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middleware/auth');
const { getTestRunsByProjectId, createTestRuns, getTestRunById, updateTestRunById, updateStatus, deleteTestRunById } = require('../controllers/testRunController');


// router.get('/', async (req, res, next) => {
//   try {
//     const { projectId } = req.query;
//     const runs = await TestRun.find({ project: projectId })
//       .populate('createdBy', 'name')
//       .populate('assignedTo', 'name')
//       .sort('-createdAt');
//     res.json(runs);
//   } catch (err) { next(err); }
// });

router.get('/', protect, getTestRunsByProjectId);

// router.post('/', async (req, res, next) => {
//   try {
//     const { name, description, project, suite, testCaseIds, assignedTo } = req.body;
//     // Auto-populate results from selected test cases
//     const tcs = await TestCase.find({ _id: { $in: testCaseIds } });
//     const results = tcs.map(tc => ({ testCase: tc._id, status: 'pending' }));
//     const run = await TestRun.create({
//       name, description, project, suite, assignedTo,
//       results, createdBy: req.user._id, status: 'planned'
//     });
//     res.status(201).json(run);
//   } catch (err) { next(err); }
// });

router.post('/', protect, createTestRuns);

// router.get('/:id', async (req, res, next) => {
//   try {
//     const run = await TestRun.findById(req.params.id)
//       .populate('createdBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .populate('results.testCase', 'title priority steps')
//       .populate('results.executedBy', 'name');
//     if (!run) return res.status(404).json({ message: 'Test run not found' });
//     res.json(run);
//   } catch (err) { next(err); }
// });

router.get('/:id', protect, getTestRunById);

// Update a single result within a run
// router.put('/:id/results/:resultId', async (req, res, next) => {
//   try {
//     const { status, notes, defectId } = req.body;
//     const run = await TestRun.findById(req.params.id);
//     const result = run.results.id(req.params.resultId);
//     if (!result) return res.status(404).json({ message: 'Result not found' });
//     result.status = status;
//     result.notes = notes;
//     result.defectId = defectId;
//     result.executedAt = new Date();
//     result.executedBy = req.user._id;

//     // Auto-update run status
//     const allDone = run.results.every(r => r.status !== 'pending');
//     if (allDone && run.status === 'in_progress') {
//       run.status = 'completed';
//       run.completedAt = new Date();
//     } else if (run.status === 'planned') {
//       run.status = 'in_progress';
//       run.startedAt = new Date();
//     }
//     await run.save();
//     res.json(run);
//   } catch (err) { next(err); }
// });

router.put('/:id/results/:resultId', protect, updateTestRunById);

// router.put('/:id/status', authorize('admin', 'manager'), async (req, res, next) => {
//   try {
//     const run = await TestRun.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
//     res.json(run);
//   } catch (err) { next(err); }
// });

router.put('/:id/status', protect, authorize('admin', 'manager'), updateStatus);

// router.delete('/:id', authorize('admin', 'manager'), async (req, res, next) => {
//   try {
//     await TestRun.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Test run deleted' });
//   } catch (err) { next(err); }
// });

router.delete('/:id', protect, authorize('admin', 'manager'), deleteTestRunById);

module.exports = router;
