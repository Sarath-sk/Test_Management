import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestRun, updateResult } from '../api/testruns';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/uiSlice';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Badge from '../components/shared/Badge';

const STATUSES = ['pass', 'fail', 'skip', 'blocked', 'pending'];
const STATUS_COLORS = { pass: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300', fail: 'bg-red-600/20 border-red-500/40 text-red-300', skip: 'bg-gray-600/20 border-gray-500/40 text-gray-300', blocked: 'bg-purple-600/20 border-purple-500/40 text-purple-300', pending: 'bg-blue-600/20 border-blue-500/40 text-blue-300' };

export default function TestRunDetail() {
  const { projectId, runId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [run, setRun] = useState(null);
  const [expandedResult, setExpandedResult] = useState(null);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  const loadRun = () => getTestRun(runId).then(r => setRun(r.data));

  useEffect(() => { loadRun().finally(() => setLoading(false)); }, [runId]);

  const handleStatusUpdate = async (resultId, status) => {
    try {
      const note = notes[resultId] || '';
      await updateResult(runId, resultId, { status, notes: note });
      await loadRun();
      dispatch(showToast({ type: 'success', message: `Marked as ${status}` }));
    } catch { dispatch(showToast({ type: 'error', message: 'Update failed' })); }
  };

  if (loading) return <Layout><div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-700 border-t-brand-500 rounded-full animate-spin" /></div></Layout>;
  if (!run) return null;

  const stats = { total: run.results.length, pass: run.results.filter(r => r.status === 'pass').length, fail: run.results.filter(r => r.status === 'fail').length, skip: run.results.filter(r => r.status === 'skip').length, pending: run.results.filter(r => r.status === 'pending').length };

  return (
    <Layout>
      <Header title={run.name} actions={
        <button className="btn-secondary text-sm" onClick={() => navigate(`/projects/${projectId}/runs`)}>← Runs</button>
      } />
      <div className="p-6 overflow-y-auto space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[['Total', stats.total, 'text-gray-300'], ['Passed', stats.pass, 'text-emerald-400'], ['Failed', stats.fail, 'text-red-400'], ['Skipped', stats.skip, 'text-gray-400'], ['Pending', stats.pending, 'text-blue-400']].map(([label, val, color]) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(((stats.total - stats.pending) / stats.total) * 100)}%</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.pass / stats.total) * 100}%` }} />
            <div className="bg-red-500 transition-all" style={{ width: `${(stats.fail / stats.total) * 100}%` }} />
            <div className="bg-gray-500 transition-all" style={{ width: `${(stats.skip / stats.total) * 100}%` }} />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {run.results.map((result) => (
            <div key={result._id} className="glass-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-800/30 transition-colors" onClick={() => setExpandedResult(expandedResult === result._id ? null : result._id)}>
                <Badge value={result.status} />
                <div className="flex-1">
                  <div className="text-gray-200 text-sm font-medium">{result.testCase?.title}</div>
                  <div className="text-gray-500 text-xs">{result.testCase?.steps?.length} steps · {result.testCase?.priority} priority</div>
                </div>
                <div className="flex items-center gap-2">
                  {STATUSES.filter(s => s !== result.status).map(status => (
                    <button key={status} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(result._id, status); }}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${STATUS_COLORS[status]} hover:opacity-100 opacity-60`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {expandedResult === result._id && (
                <div className="border-t border-gray-800 px-5 py-4 space-y-3">
                  {result.testCase?.steps?.length > 0 && (
                    <div className="space-y-2">
                      {result.testCase.steps.map(step => (
                        <div key={step.stepNo} className="flex gap-3 text-xs">
                          <div className="w-5 h-5 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center flex-shrink-0 font-mono">{step.stepNo}</div>
                          <div><div className="text-gray-300">{step.action}</div><div className="text-gray-500 mt-0.5">Expected: {step.expectedResult}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-1">Notes / Defect ID</label>
                    <input className="input-field text-xs" placeholder="Add notes or defect reference..." value={notes[result._id] || result.notes || ''} onChange={e => setNotes(n => ({ ...n, [result._id]: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
