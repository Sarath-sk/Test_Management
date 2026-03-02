import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuites } from '../api/suites';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/uiSlice';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Badge from '../components/shared/Badge';

export default function Import() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [suites, setSuites] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { getSuites(projectId).then(r => setSuites(r.data)); }, [projectId]);

  const handleFileChange = (e) => { setFile(e.target.files[0]); setPreview(null); };

  const handlePreview = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/import/preview', fd);
      setPreview(res.data);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err.response?.data?.message || 'Failed to parse file' }));
    } finally { setUploading(false); }
  };

  const handleImport = async () => {
    if (!selectedSuite) { dispatch(showToast({ type: 'error', message: 'Select a test suite first' })); return; }
    setImporting(true);
    try {
      const res = await api.post('/import/confirm', { rows: preview.rows, suiteId: selectedSuite, projectId });
      dispatch(showToast({ type: 'success', message: `${res.data.count} test cases imported!` }));
      navigate(`/projects/${projectId}`);
    } catch { dispatch(showToast({ type: 'error', message: 'Import failed' })); }
    finally { setImporting(false); }
  };

  const handleDownloadTemplate = () => { window.open('/api/import/template', '_blank'); };
  const handleExport = () => {
    const params = new URLSearchParams({ projectId, ...(selectedSuite && { suiteId: selectedSuite }) });
    window.open(`/api/import/export?${params}`, '_blank');
  };

  return (
    <Layout>
      <Header title="Import / Export" actions={
        <button className="btn-secondary text-sm" onClick={() => navigate(`/projects/${projectId}`)}>← Back</button>
      } />
      <div className="p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Export section */}
          <div className="glass-card rounded-xl p-5">
            <div className="text-gray-300 font-medium text-sm mb-3">Export Test Cases</div>
            <div className="flex items-center gap-3">
              <select className="input-field max-w-xs" value={selectedSuite} onChange={e => setSelectedSuite(e.target.value)}>
                <option value="">All suites</option>
                {suites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <button className="btn-secondary text-sm" onClick={handleExport}>↓ Export XLSX</button>
            </div>
          </div>

          {/* Import section */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-300 font-medium text-sm">Import Test Cases</div>
              <button className="text-brand-400 text-xs hover:underline" onClick={handleDownloadTemplate}>Download template</button>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">Target Suite *</label>
              <select className="input-field" value={selectedSuite} onChange={e => setSelectedSuite(e.target.value)}>
                <option value="">Select suite...</option>
                {suites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">File (CSV or XLSX)</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-brand-500/50 transition-colors">
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="importFile" />
                <label htmlFor="importFile" className="cursor-pointer">
                  <div className="text-3xl mb-2">📎</div>
                  <div className="text-gray-400 text-sm">{file ? file.name : 'Click to upload CSV or XLSX file'}</div>
                  <div className="text-gray-600 text-xs mt-1">Max 10MB</div>
                </label>
              </div>
            </div>

            <button className="btn-secondary text-sm" onClick={handlePreview} disabled={!file || uploading}>
              {uploading ? 'Parsing...' : '🔍 Preview Data'}
            </button>

            {preview && (
              <div>
                <div className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 text-xs flex items-center justify-center">✓</span>
                  Found <strong className="text-gray-200">{preview.count}</strong> test cases ready to import
                </div>
                <div className="glass-card rounded-lg overflow-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-700">
                      {['Title','Priority','Tags','Steps'].map(h => <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {preview.rows.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="px-3 py-2 text-gray-300 max-w-xs truncate">{row.title}</td>
                          <td className="px-3 py-2"><Badge value={row.priority} /></td>
                          <td className="px-3 py-2 text-gray-400">{row.tags?.join(', ')}</td>
                          <td className="px-3 py-2 text-gray-500">{row.steps?.length} steps</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.count > 20 && <div className="px-3 py-2 text-gray-600 text-xs">...and {preview.count - 20} more</div>}
                </div>
                <button className="btn-primary mt-3 text-sm" onClick={handleImport} disabled={importing}>
                  {importing ? 'Importing...' : `↑ Import ${preview.count} Test Cases`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
