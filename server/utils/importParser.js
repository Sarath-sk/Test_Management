const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const stream = require('stream');

/**
 * Expected columns (case-insensitive):
 * Title | Description | Preconditions | Steps | Expected Result | Priority | Tags | Type
 */
const normalize = (key) => key.toLowerCase().trim().replace(/\s+/g, '_');

const mapRow = (row) => {
  const r = {};
  for (const [k, v] of Object.entries(row)) r[normalize(k)] = v;

  // Parse steps: either JSON array or numbered text
  let steps = [];
  const rawSteps = r.steps || r.test_steps || '';
  const rawExpected = r.expected_result || r.expected || '';
  if (rawSteps) {
    try {
      steps = JSON.parse(rawSteps);
    } catch {
      steps = rawSteps.split(/\n|\|/).map((s, i) => ({
        stepNo: i + 1,
        action: s.trim(),
        expectedResult: rawExpected || 'As expected'
      }));
    }
  }

  return {
    title: r.title || r.test_case || r.name || 'Untitled',
    description: r.description || '',
    preconditions: r.preconditions || r.precondition || '',
    steps,
    priority: ['low', 'medium', 'high', 'critical'].includes(r.priority?.toLowerCase()) ? r.priority.toLowerCase() : 'medium',
    type: ['functional', 'regression', 'smoke', 'integration', 'performance', 'security'].includes(r.type?.toLowerCase()) ? r.type.toLowerCase() : 'functional',
    tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    status: 'draft'
  };
};

exports.parseXLSX = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows.map(mapRow);
};

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => results.push(mapRow(row)))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};
