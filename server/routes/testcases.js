const router = require('express').Router();
const TestCase = require('../models/TestCase');
const XLSX = require('xlsx');
const { protect } = require('../middleware/auth');
const {getTestcases, getTestcaseById, createTestcase, updateTestcaseById, deleteTestcaseById, deleteAllTestcases, exportTestcases} = require("../controllers/testCaseController");

// GET /api/testcases?projectId=&suiteId=&priority=&status=&search=
// router.get('/', protect, async (req, res) => {
//   try {
//     const { projectId, suiteId, priority, status, type, search, page = 1, limit = 50 } = req.query;
//     const query = {};
//     if (projectId) query.project = projectId;
//     if (suiteId) query.suite = suiteId;
//     if (priority) query.priority = priority;
//     if (status) query.status = status;
//     if (type) query.type = type;
//     if (search) query.$text = { $search: search };

//     const total = await TestCase.countDocuments(query);
//     const testCases = await TestCase.find(query)
//       .populate('createdBy', 'name avatar')
//       .populate('assignedTo', 'name avatar')
//       .populate('suite', 'name')
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     res.json({ testCases, total, page: Number(page), pages: Math.ceil(total / limit) });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });
router.get('/', protect, getTestcases);


// GET /api/testcases/:id
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const tc = await TestCase.findById(req.params.id)
//       .populate('createdBy', 'name avatar')
//       .populate('assignedTo', 'name avatar')
//       .populate('suite', 'name')
//       .populate('project', 'name');
//     if (!tc) return res.status(404).json({ message: 'Test case not found' });
//     res.json(tc);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.get('/:id', protect, getTestcaseById);

// POST /api/testcases
// router.post('/', protect, async (req, res) => {
//   try {
//     const tc = await TestCase.create({ ...req.body, createdBy: req.user._id });
//     res.status(201).json(tc);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });
router.post('/', protect, createTestcase);

// PUT /api/testcases/:id
// router.put('/:id', protect, async (req, res) => {
//   try {
//     const tc = await TestCase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//     if (!tc) return res.status(404).json({ message: 'Test case not found' });
//     res.json(tc);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });
router.put('/:id', protect, updateTestcaseById);

// DELETE /api/testcases/:id
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
//     await TestCase.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Test case deleted' });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.delete('/:id', protect, deleteTestcaseById);

// POST /api/testcases/bulk-delete
// router.post('/bulk-delete', protect, async (req, res) => {
//   try {
//     if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
//     const { ids } = req.body;
//     await TestCase.deleteMany({ _id: { $in: ids } });
//     res.json({ message: `${ids.length} test case(s) deleted` });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.post('/bulk-delete', protect, deleteAllTestcases);

// GET /api/testcases/export?projectId=&suiteId= - Export to XLSX
// router.get('/export/xlsx', protect, async (req, res) => {
//   try {
//     const { projectId, suiteId } = req.query;
//     const query = {};
//     if (projectId) query.project = projectId;
//     if (suiteId) query.suite = suiteId;

//     const testCases = await TestCase.find(query)
//       .populate('suite', 'name')
//       .populate('assignedTo', 'name');

//     const rows = testCases.map(tc => ({
//       Title: tc.title,
//       Description: tc.description || '',
//       Preconditions: tc.preconditions || '',
//       Steps: tc.steps.map(s => `${s.stepNo}. ${s.action}`).join('\n'),
//       'Expected Results': tc.steps.map(s => s.expectedResult).join('\n'),
//       Priority: tc.priority,
//       Type: tc.type,
//       Status: tc.status,
//       Suite: tc.suite?.name || '',
//       Tags: tc.tags.join(', '),
//       'Assigned To': tc.assignedTo?.name || '',
//       'Created At': tc.createdAt.toISOString().split('T')[0]
//     }));

//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(rows);
//     XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
//     const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', 'attachment; filename="testcases.xlsx"');
//     res.send(buffer);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.get('/export/xlsx', protect, exportTestcases);

module.exports = router;
