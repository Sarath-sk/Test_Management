import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestRuns, createTestRun, deleteTestRun } from '../api/testruns';
import { getTestCases } from '../api/testcases';
import { getSuites } from '../api/suites';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../store/slices/uiSlice';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Modal from '../components/shared/Modal';
import Badge from '../components/shared/Badge';
import Empty from '../components/shared/Empty';
import { formatDate } from '../utils/helpers';

export default function TestRuns() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [runs, setRuns] = useState([]);
  const [modal, setModal] = useState(false);
  const [suites, setSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [selectedTCs, setSelectedTCs] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', suite: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTestRuns(projectId).then(r => setRuns(r.data)).finally(() => setLoading(false));
    getSuites(projectId).then(r => setSuites(r.data));
  }, [projectId]);

  useEffect(() => {
    if (modal) getTestCases({ projectId }).then(r => setTestCases(r.data.testCases));
  }, [modal]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTestRun({ ...form, project: projectId, testCaseIds: selectedTCs });
      getTestRuns(projectId).then(r => setRuns(r.data));
      dispatch(showToast({ type: 'success', message: 'Test run created!' }));
      setModal(false);
      setForm({ name: '', description: '', suite: '' });
      setSelectedTCs([]);
    } catch { dispatch(showToast({ type: 'error', message: 'Failed to create test run' })); }
  };

  const toggleTC = (id) => setSelectedTCs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <Layout>
      <Header title="Test Runs" actions={<>
        <button className="btn-secondary text-sm" onClick={() => navigate(`/projects/${projectId}`)}>← Project</button>
        <button className="btn-primary text-sm" onClick={() => setModal(true)}>+ New Run</button>
      </>} />

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gray-700 border-t-brand-500 rounded-full animate-spin" /></div>
        ) : runs.length === 0 ? (
          <Empty icon="▶️" title="No test runs yet" description="Create a test run to start executing test cases" />
        ) : (
          <div className="space-y-3">
            {runs.map(run => {
              const total = run.results?.length || 0;
              const done = run.results?.filter(r => r.status !== 'pending').length || 0;
              const passed = run.results?.filter(r => r.status === 'pass').length || 0;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={run._id} onClick={() => navigate(`/projects/${projectId}/runs/${run._id}`)} className="glass-card rounded-xl p-5 cursor-pointer hover:border-brand-500/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-gray-100 font-semibold">{run.name}</div>
                      <div className="text-gray-500 text-xs mt-1">Created by {run.createdBy?.name} · {formatDate(run.createdAt)}</div>
                    </div>
                    <Badge value={run.status} />
                  </div>
                  {total > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>{done}/{total} executed · {passed} passed</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Test Run" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Run Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Sprint 12 Regression" /></div>
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Description</label>
            <textarea className="input-field h-16 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div>
            <label className="block text-gray-400 text-xs font-medium mb-1.5">Select Test Cases ({selectedTCs.length} selected)</label>
            <div className="border border-gray-700 rounded-lg overflow-auto max-h-52">
              {testCases.map(tc => (
                <label key={tc._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800/50">
                  <input type="checkbox" checked={selectedTCs.includes(tc._id)} onChange={() => toggleTC(tc._id)} className="accent-brand-500" />
                  <span className="text-gray-300 text-sm flex-1">{tc.title}</span>
                  <Badge value={tc.priority} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={selectedTCs.length === 0}>Create Run</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
