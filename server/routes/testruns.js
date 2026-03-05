const express = require('express');
const router = express.Router();
const TestRun = require('../models/TestRun');
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middleware/auth');
const { getTestRunsByProjectId, createTestRuns, getTestRunById, updateTestRunById, updateStatus, deleteTestRunById } = require('../controllers/testRunController');



router.get('/', protect, getTestRunsByProjectId);

router.post('/', protect, createTestRuns);

router.get('/:id', protect, getTestRunById);

router.put('/:id/results/:resultId', protect, updateTestRunById);

router.put('/:id/status', protect, authorize('admin', 'manager'), updateStatus);

router.delete('/:id', protect, authorize('admin', 'manager'), deleteTestRunById);

module.exports = router;
