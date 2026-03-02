import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Upload, FileSpreadsheet, CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [suites, setSuites] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [preview, setPreview] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  React.useEffect(() => {
    api.get('/suites', { params: { projectId } }).then(r => setSuites(r.data));
  }, [projectId]);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const { data } = await api.post('/import/preview', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPreview(data.rows);
      setAllRows(data.allRows);
      setStep(2);
      toast.success(`Found ${data.total} test cases`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to parse file');
    } finally { setLoading(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'], 'text/csv': ['.csv'] }, multiple: false
  });

  const handleCommit = async () => {
    if (!selectedSuite) return toast.error('Please select a target suite');
    setLoading(true);
    try {
      const { data } = await api.post('/import/commit', { rows: allRows, projectId, suiteId: selectedSuite });
      toast.success(data.message);
      navigate(`/projects/${projectId}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Import failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Import Test Cases</h1>
          <p className="text-sm text-slate-500">Upload a .csv or .xlsx file to import test cases in bulk</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="card p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-slate-800 mb-2">Expected File Format</h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-600 overflow-x-auto">
              Title | Description | Preconditions | Steps | Expected Result | Priority | Type | Tags
            </div>
          </div>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'}`}>
            <input {...getInputProps()} />
            {loading ? (
              <p className="text-slate-500">Parsing file...</p>
            ) : (
              <>
                <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">{isDragActive ? 'Drop it!' : 'Drop your file here'}</p>
                <p className="text-sm text-slate-400 mt-1">or click to browse — .xlsx, .xls, .csv supported</p>
              </>
            )}
          </div>
        </div>
      )}

      {step === 2 && preview && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-sm font-medium">Preview of first 5 rows ({allRows.length} total)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead><tr className="bg-slate-50">{['Title','Priority','Type','Steps','Tags'].map(h => <th key={h} className="px-3 py-2 text-left border border-slate-200 text-slate-500 font-semibold uppercase tracking-wide">{h}</th>)}</tr></thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-3 py-2 border border-slate-200 font-medium">{row.title}</td>
                    <td className="px-3 py-2 border border-slate-200"><span className={`badge-${row.priority}`}>{row.priority}</span></td>
                    <td className="px-3 py-2 border border-slate-200 capitalize">{row.type}</td>
                    <td className="px-3 py-2 border border-slate-200">{row.steps?.length || 0} steps</td>
                    <td className="px-3 py-2 border border-slate-200">{row.tags?.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <label className="label">Target Suite *</label>
            <select className="input" value={selectedSuite} onChange={e => setSelectedSuite(e.target.value)}>
              <option value="">Select suite...</option>
              {suites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center">Back</button>
            <button onClick={() => { if (selectedSuite) setStep(3); else toast.error('Select a suite first'); }} className="btn-primary flex-1 justify-center">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-6 space-y-5 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Ready to import</h2>
            <p className="text-slate-500 mt-1">{allRows.length} test cases will be added to <strong>{suites.find(s => s._id === selectedSuite)?.name}</strong></p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-ghost flex-1 justify-center">Back</button>
            <button onClick={handleCommit} disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
              {loading ? 'Importing...' : `Import ${allRows.length} Test Cases`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
