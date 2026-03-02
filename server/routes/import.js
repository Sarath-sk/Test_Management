const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TestCase = require('../models/TestCase');
const { protect } = require('../middleware/auth');
const { parseXLSX, parseCSV } = require('../utils/importParser');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls', '.csv'].includes(ext)) cb(null, true);
    else cb(new Error('Only .xlsx, .xls, .csv files are allowed'));
  }
});

// POST /api/import - Upload and preview
router.post('/preview', protect, upload.single('file'), async (req, res) => {
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    let rows;
    if (ext === '.csv') rows = await parseCSV(req.file.path);
    else rows = parseXLSX(req.file.path);
    
    fs.unlinkSync(req.file.path);
    res.json({ rows: rows.slice(0, 5), total: rows.length, allRows: rows });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(400).json({ message: err.message });
  }
});

// POST /api/import/commit - Save parsed rows to DB
router.post('/commit', protect, async (req, res) => {
  try {
    const { rows, projectId, suiteId } = req.body;
    if (!rows?.length) return res.status(400).json({ message: 'No rows to import' });

    const docs = rows.map(row => ({
      ...row,
      project: projectId,
      suite: suiteId,
      createdBy: req.user._id
    }));

    const result = await TestCase.insertMany(docs);
    res.status(201).json({ message: `${result.length} test cases imported`, count: result.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
