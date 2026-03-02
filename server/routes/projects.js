const router = require('express').Router();
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const { protect, authorize } = require('../middleware/auth');
const {canManage, projectsList, getProjectById, createProject,updateProjectById, deleteProjectById, addMembersToProject} = require("../controllers/projectController");


// GET /api/projects
// router.get('/', protect, async (req, res) => {
//   try {
//     let query = {};
//     if (req.user.role !== 'admin') {
//       query = { $or: [{ createdBy: req.user._id }, { 'members.user': req.user._id }] };
//     }
//     const projects = await Project.find(query)
//       .populate('createdBy', 'name email avatar')
//       .populate('members.user', 'name email avatar')
//       .sort({ updatedAt: -1 });
    
//     // Attach test case counts
//     const counts = await TestCase.aggregate([
//       { $group: { _id: '$project', count: { $sum: 1 } } }
//     ]);
//     const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    
//     const result = projects.map(p => ({
//       ...p.toJSON(),
//       testCaseCount: countMap[p._id.toString()] || 0
//     }));
//     res.json(result);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });
router.get('/', protect, projectsList);

// GET /api/projects/:id
// router.get('/:id', protect, async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate('createdBy', 'name email avatar')
//       .populate('members.user', 'name email avatar');
//     if (!project) return res.status(404).json({ message: 'Project not found' });
//     res.json(project);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });
router.get('/:id', protect, getProjectById);

// POST /api/projects
// router.post('/', protect, canManage, async (req, res) => {
//   try {
//     const project = await Project.create({ ...req.body, createdBy: req.user._id });
//     res.status(201).json(project);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.post('/', protect, canManage, createProject);



// PUT /api/projects/:id
// router.put('/:id', protect, canManage, async (req, res) => {
//   try {
//     const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!project) return res.status(404).json({ message: 'Project not found' });
//     res.json(project);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.put('/:id', protect, canManage, updateProjectById);

// DELETE /api/projects/:id
// router.delete('/:id', protect, authorize('admin'), async (req, res) => {
//   try {
//     await Project.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Project deleted' });
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.delete('/:id', protect, authorize('admin'), deleteProjectById);

// POST /api/projects/:id/members
// router.post('/:id/members', protect, canManage, async (req, res) => {
//   try {
//     const { userId, role } = req.body;
//     const project = await Project.findById(req.params.id);
//     if (!project) return res.status(404).json({ message: 'Project not found' });
//     const exists = project.members.find(m => m.user.toString() === userId);
//     if (exists) return res.status(400).json({ message: 'User already a member' });
//     project.members.push({ user: userId, role });
//     await project.save();
//     res.json(project);
//   } catch (err) { res.status(500).json({ message: err.message }); }
// });

router.post('/:id/members', protect, canManage, addMembersToProject);

module.exports = router;
