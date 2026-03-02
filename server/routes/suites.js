const router = require('express').Router();
const TestSuite = require('../models/TestSuite');
const { protect, authorize } = require('../middleware/auth');
const {getSuitesByProjectId, createTestSuites, updateSuiteById, deleteSuiteById} = require('../controllers/testSuiteController');

// GET /api/suites?projectId=xxx - returns tree structure
// router.get('/', protect, async (req, res) => {
//   try {
//     const { projectId } = req.query;
//     if (!projectId) return res.status(400).json({ message: 'projectId is required' });
//     const suites = await TestSuite.find({ project: projectId })
//       .populate('createdBy', 'name')
//       .sort({ order: 1, name: 1 });
//     res.json(suites);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.get('/', protect, getSuitesByProjectId);

// POST /api/suites
// router.post('/', protect, async (req, res) => {
//   try {
//     if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
//     const suite = await TestSuite.create({ ...req.body, createdBy: req.user._id });
//     res.status(201).json(suite);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.post('/', protect, createTestSuites);

// PUT /api/suites/:id
// router.put('/:id', protect, async (req, res) => {
//   try {
//     if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
//     const suite = await TestSuite.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!suite) return res.status(404).json({ message: 'Suite not found' });
//     res.json(suite);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.put('/:id', protect, updateSuiteById);

// DELETE /api/suites/:id
// router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
//   try {
//     await TestSuite.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Suite deleted' });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.delete('/:id', protect, deleteSuiteById);

module.exports = router;
