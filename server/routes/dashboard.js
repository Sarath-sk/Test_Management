const router = require('express').Router();
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const TestRun = require('../models/TestRun');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalProjects,
      totalTestCases,
      totalRuns,
      totalUsers,
      priorityStats,
      statusStats,
      recentRuns,
      passRateByProject
    ] = await Promise.all([
      Project.countDocuments(),
      TestCase.countDocuments(),
      TestRun.countDocuments(),
      User.countDocuments(),
      TestCase.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      TestCase.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      TestRun.find().populate('project', 'name').sort({ createdAt: -1 }).limit(5),
      TestRun.aggregate([
        { $unwind: '$results' },
        { $group: { _id: { project: '$project', status: '$results.status' }, count: { $sum: 1 } } },
        { $group: {
          _id: '$_id.project',
          total: { $sum: '$count' },
          pass: { $sum: { $cond: [{ $eq: ['$_id.status', 'pass'] }, '$count', 0] } }
        }},
        { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        { $project: { name: '$project.name', total: 1, pass: 1, passRate: { $multiply: [{ $divide: ['$pass', '$total'] }, 100] } } },
        { $sort: { passRate: -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      totals: { projects: totalProjects, testCases: totalTestCases, runs: totalRuns, users: totalUsers },
      priorityStats,
      statusStats,
      recentRuns,
      passRateByProject
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/activity - Recent test case changes
router.get('/activity', protect, async (req, res) => {
  try {
    const recentTestCases = await TestCase.find()
      .populate('createdBy', 'name avatar')
      .populate('project', 'name')
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(recentTestCases);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
