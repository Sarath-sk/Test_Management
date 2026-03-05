const router = require('express').Router();
const TestCase = require('../models/TestCase');
const XLSX = require('xlsx');
const { protect } = require('../middleware/auth');
const {getTestcases, getTestcaseById, createTestcase, updateTestcaseById, deleteTestcaseById, deleteAllTestcases, exportTestcases} = require("../controllers/testCaseController");

// GET /api/testcases?projectId=&suiteId=&priority=&status=&search=
router.get('/', protect, getTestcases);

// GET /api/testcases/:id
router.get('/:id', protect, getTestcaseById);

// POST /api/testcases
router.post('/', protect, createTestcase);

// PUT /api/testcases/:id
router.put('/:id', protect, updateTestcaseById);

// DELETE /api/testcases/:id
router.delete('/:id', protect, deleteTestcaseById);

// POST /api/testcases/bulk-delete
router.post('/bulk-delete', protect, deleteAllTestcases);

// GET /api/testcases/export?projectId=&suiteId= - Export to XLSX
router.get('/export/xlsx', protect, exportTestcases);

module.exports = router;
