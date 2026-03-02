const Project = require('../models/Project');

// Role hierarchy: admin > manager > tester
const roleLevel = { admin: 3, manager: 2, tester: 1 };

/**
 * Require a global role level
 * @param  {...string} roles - allowed roles
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient global role' });
  }
  next();
};

/**
 * Require membership in a project with minimum role level
 * Expects req.params.projectId or req.body.project
 */
const requireProjectAccess = (minRole = 'tester') => async (req, res, next) => {
  try {
    // Admins bypass project-level checks
    if (req.user.role === 'admin') return next();

    const projectId = req.params.projectId || req.params.id || req.body.project;
    if (!projectId) return res.status(400).json({ message: 'Project ID required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member) return res.status(403).json({ message: 'Not a member of this project' });

    if (roleLevel[member.role] < roleLevel[minRole]) {
      return res.status(403).json({ message: `Requires ${minRole} role in this project` });
    }

    req.project = project;
    req.projectRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, requireProjectAccess };
