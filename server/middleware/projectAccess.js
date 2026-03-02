const Project = require('../models/Project');

// Check user is member of project (or admin)
exports.projectMember = async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const projectId = req.params.projectId || req.body.project || req.query.project;
  if (!projectId) return res.status(400).json({ message: 'Project ID required' });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const member = project.members.find(m => m.user.toString() === req.user._id.toString());
  if (!member) return res.status(403).json({ message: 'Access denied to this project' });
  req.projectRole = member.role;
  next();
};
