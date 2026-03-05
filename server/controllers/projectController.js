const Project = require("../models/Project");
const TestCase = require("../models/TestCase");
const { protect, authorize } = require("../middleware/auth");
const TestSuite = require("../models/TestSuite");

const canManage = (req, res, next) => {
  if (!["admin", "manager"].includes(req.user.role))
    return res.status(403).json({ message: "Insufficient permissions" });
  next();
};

// list of projects
const projectsList = async (req, res) => {
  try {
    let query = {};
    const isAdmin = req.body.role === "admin";
    if (!isAdmin) {
      query = {
        $or: [{ createdBy: req.user._id }, { "members.user": req.user._id }],
      };
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name email avater")
      .populate("members.user", "name email avater")
      .sort({ updatedAt: -1 });

    // Testcases count
    const counts = await TestCase.aggregate([
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    const result = projects.map((p) => ({
      ...p.toJSON(),
      testCaseCount: countMap[p._id.toString()] || 0,
    }));
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Get project by Id
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId)
      .populate("createdBy", "name email avatar")
      .populate("members.user", "name email avatar");

    if (!project) {
      return res.status(404).json({
        message: "Project not found!",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    if (!name) {
      return res.status(400).json({
        message: "Please fill mandatory fields",
      });
    }

    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id,
      members: members.map((id) => ({
        user: id,
        role: "manager",
      })),
    });

    res.status(201).json(project);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update project by id
const updateProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findByIdAndUpdate(projectId, req.body, {
      new: true,
    });
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete project by id
const deleteProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(400).json({
        message: "Insufficient permissions",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found!",
      });
    }

    await TestCase.deleteMany({ project: projectId });
    await TestSuite.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      message: "Project deleted successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "somethin went wrong",
      error: error.message,
    });
  }
};

// add members to the project by ID
const addMembersToProject = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found!",
      });
    }

    const isExists = project.members.find((m) => m.user.toString() == userId);
    if (isExists) {
      return res.status(400).json({
        message: "User already a member in this project",
      });
    }

    project.members.push({ user: userId, role });
    await project.save();

    res.status(200).json(project);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  canManage,
  projectsList,
  getProjectById,
  createProject,
  updateProjectById,
  deleteProjectById,
  addMembersToProject,
};
