const router = require('express').Router();
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middleware/auth');
const {canManage, projectsList, getProjectById, createProject,updateProjectById, deleteProjectById, addMembersToProject} = require("../controllers/projectController");


// GET /api/projects
router.get('/', protect, projectsList);

// GET /api/projects/:id
router.get('/:id', protect, getProjectById);

// POST /api/projects
router.post('/', protect, canManage, createProject);

// PUT /api/projects/:id
router.put('/:id', protect, canManage, updateProjectById);

// DELETE /api/projects/:id
router.delete('/:id', protect, authorize('admin'), deleteProjectById);

// POST /api/projects/:id/members
router.post('/:id/members', protect, canManage, addMembersToProject);

module.exports = router;
