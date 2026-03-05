const router = require('express').Router();
const TestSuite = require('../models/TestSuite');
const { protect, authorize } = require('../middleware/auth');
const {getSuitesByProjectId, createTestSuites, updateSuiteById, deleteSuiteById} = require('../controllers/testSuiteController');

// GET /api/suites?projectId=xxx - returns tree structure
router.get('/', protect, getSuitesByProjectId);

// POST /api/suites
router.post('/', protect, createTestSuites);

// PUT /api/suites/:id
router.put('/:id', protect, updateSuiteById);

// DELETE /api/suites/:id
router.delete('/:id', protect, deleteSuiteById);

module.exports = router;
