const TestCase = require("../models/TestCase");
const XLSX = require("xlsx");

// Get all the testcases
const getTestcases = async (req, res) => {
  try {
    const {
      projectId,
      suiteId,
      priority,
      status,
      type,
      search,
      page = 1,
      limit = 50,
    } = req.query;
    const query = {};
    if (projectId) query.project = projectId;
    if (suiteId) query.suite = suiteId;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) query.$text = { $search: search };

    const total = await TestCase.countDocuments(query);
    const testCases = await TestCase.find(query)
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .populate("suite", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      testCases,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// get testcase by ID
const getTestcaseById = async (req, res) => {
  try {
    const testcaseId = req.params.id;
    const tc = await TestCase.findById(testcaseId)
      .populate("createdBy", "name avatar")
      .populate("assignedTo", "name avatar")
      .populate("suite", "name")
      .populate("project", "name");

    if (!tc) {
      return res.status(404).json({
        message: "Testcase not found!",
      });
    }

    res.status(200).json(tc);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Create testcase
const createTestcase = async (req, res) => {
  try {
    const { title, suite, project, steps } = req.body;

    if (!title || !suite || !project) {
      return res.status(400).json({
        message: "Title, suite and project are required",
      });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        message: "At least one step is required",
      });
    }

    for (const step of steps) {
      if (!step.stepNo || !step.action || !step.expectedResult) {
        return res.status(400).json({
          message: "Each step must contain stepNo, action and expectedResult",
        });
      }
    }

    const tc = await TestCase.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json(tc);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Update testcase by Id
const updateTestcaseById = async (req, res) => {
  try {
    const tcId = req.params.id;
    const tc = await TestCase.findByIdAndUpdate(tcId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tc) {
      return res.status(404).json({
        message: "Test case not found!",
      });
    }

    res.status(200).json(tc);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete testcase by Id
const deleteTestcaseById = async (req, res) => {
  try {
    const tcId = req.params.id;
    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    await TestCase.findByIdAndDelete(tcId);
    res.status(200).json({
      message: "testcase deleted!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// Delete all testcases
const deleteAllTestcases = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!["admin", "manager"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    await TestCase.deleteMany({
      _id: { $in: ids },
    });

    res.status(200).json({
      message: `${ids.length} testcase(s) deleted!`,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//Exporting testcases to XLSX
const exportTestcases = async (req, res) => {
  try {
    const { projectId, suiteId } = req.body;
    let query = {};
    if (projectId) query.project = projectId;
    if (suiteId) query.suite - suiteId;

    const testcases = await TestCase.find(query)
      .populate("suite", "name")
      .populate("assignedTo", "name");

    const rows = testcases.map((tc) => ({
      Title: tc.title,
      Description: tc.description || "",
      Preconditions: tc.preconditions || "",
      Steps: tc.steps.map((s) => `${s.stepNo}. ${s.action}`).join("\n"),
      "Expected Results": tc.steps.map((s) => s.expectedResult).join("\n"),
      Priority: tc.priority,
      Type: tc.type,
      Status: tc.status,
      Suite: tc.suite?.name || "",
      Tags: tc.tags.join(", "),
      "Assigned To": tc.assignedTo?.name || "",
      "Created At": tc.createdAt.toISOString().split("T")[0],
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Test Cases");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="testcases.xlsx"',
    );
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getTestcases,
  getTestcaseById,
  createTestcase,
  updateTestcaseById,
  deleteTestcaseById,
  deleteAllTestcases,
  exportTestcases,
};
