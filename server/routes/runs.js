const router = require('express').Router();
const TestRun = require('../models/TestRun');
const TestCase = require('../models/TestCase');
const { protect } = require('../middleware/auth');

// GET /api/runs?projectId=
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = projectId ? { project: projectId } : {};
    const runs = await TestRun.find(query)
      .populate('createdBy', 'name avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(runs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/runs/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const run = await TestRun.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('results.testCase')
      .populate('results.executedBy', 'name avatar');
    if (!run) return res.status(404).json({ message: 'Test run not found' });
    res.json(run);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/runs - Create a test run from a suite or project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, project, suite } = req.body;
    const tcQuery = { project };
    if (suite) tcQuery.suite = suite;
    const testCases = await TestCase.find(tcQuery).select('_id');
    
    const results = testCases.map(tc => ({
      testCase: tc._id,
      status: 'untested'
    }));

    const run = await TestRun.create({
      name, description, project, suite,
      results,
      createdBy: req.user._id,
      status: 'planned'
    });
    res.status(201).json(run);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/runs/:id/results/:testCaseId - Update a single result
router.put('/:id/results/:testCaseId', protect, async (req, res) => {
  try {
    const { status, notes, duration } = req.body;
    const run = await TestRun.findById(req.params.id);
    if (!run) return res.status(404).json({ message: 'Test run not found' });

    const result = run.results.find(r => r.testCase.toString() === req.params.testCaseId);
    if (!result) return res.status(404).json({ message: 'Test case not in this run' });

    result.status = status;
    result.notes = notes;
    result.duration = duration;
    result.executedBy = req.user._id;
    result.executedAt = new Date();

    // Update test case last execution
    await TestCase.findByIdAndUpdate(req.params.testCaseId, {
      lastExecutedAt: new Date(),
      lastExecutionStatus: status
    });

    // Auto-update run status
    const allDone = run.results.every(r => r.status !== 'untested');
    if (allDone && run.status !== 'completed') {
      run.status = 'completed';
      run.completedAt = new Date();
    } else if (run.status === 'planned') {
      run.status = 'in_progress';
      run.startedAt = new Date();
    }

    await run.save();
    res.json(run);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
