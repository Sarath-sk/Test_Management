import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Play, CheckCircle2, XCircle, MinusCircle, Ban, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pass:    { label: 'Pass',    icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', badge: 'badge-pass' },
  fail:    { label: 'Fail',    icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200',           badge: 'badge-fail' },
  skip:    { label: 'Skip',    icon: MinusCircle,  color: 'text-slate-500 bg-slate-50 border-slate-200',    badge: 'badge-skip' },
  blocked: { label: 'Blocked', icon: Ban,          color: 'text-purple-600 bg-purple-50 border-purple-200', badge: 'badge-blocked' },
  untested:{ label: 'Untested',icon: Play,         color: 'text-slate-300 bg-white border-slate-200',       badge: 'badge' }
};

function NewRunModal({ projectId, suites, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', suite: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/runs', { ...form, project: projectId, suite: form.suite || undefined });
    onCreated(data);
    onClose();
    toast.success('Test run created!');
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-bold text-lg text-slate-900 mb-5">New Test Run</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Run Name *</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Sprint 12 Regression" /></div>
          <div><label className="label">Suite (optional)</label>
            <select className="input" value={form.suite} onChange={e => setForm(f => ({...f, suite: e.target.value}))}>
              <option value="">All test cases in project</option>
              {suites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Create Run</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TestRunPage() {
  const { projectId } = useParams();
  const [runs, setRuns] = useState([]);
  const [suites, setSuites] = useState([]);
  const [activeRun, setActiveRun] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/runs', { params: { projectId } }),
      api.get('/suites', { params: { projectId } })
    ]).then(([r, s]) => { setRuns(r.data); setSuites(s.data); }).finally(() => setLoading(false));
  }, [projectId]);

  const openRun = async (runId) => {
    if (activeRun?._id === runId) return setActiveRun(null);
    const { data } = await api.get(`/runs/${runId}`);
    setActiveRun(data);
  };

  const updateResult = async (testCaseId, status, notes = '') => {
    const { data } = await api.put(`/runs/${activeRun._id}/results/${testCaseId}`, { status, notes });
    setActiveRun(data);
    setRuns(prev => prev.map(r => r._id === data._id ? data : r));
  };

  const getStats = (run) => run.stats || run.results?.reduce((acc, r) => {
    acc.total = (acc.total || 0) + 1;
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Runs</h1>
          <p className="text-slate-500 text-sm">Execute and track test results</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" /> New Run</button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : runs.length === 0 ? (
        <div className="text-center py-16 card p-10">
          <Play className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No test runs yet</p>
          <p className="text-slate-400 text-sm mb-4">Create your first test run to start executing</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">Create Test Run</button>
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map(run => {
            const stats = getStats(run);
            const isActive = activeRun?._id === run._id;
            return (
              <div key={run._id} className="card overflow-hidden">
                <div onClick={() => openRun(run._id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${run.status === 'completed' ? 'bg-emerald-500' : run.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <div>
                      <p className="font-semibold text-slate-900">{run.name}</p>
                      <p className="text-xs text-slate-400">{new Date(run.createdAt).toLocaleDateString()} · {stats?.total || 0} tests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {stats && (
                      <div className="flex items-center gap-2 text-xs">
                        {['pass','fail','skip','blocked'].map(s => stats?.[s] > 0 && (
                          <span key={s} className={`badge-${s}`}>{stats[s]} {s}</span>
                        ))}
                        {stats.total > 0 && (
                          <span className="font-bold text-slate-700">{stats.passRate || Math.round(((stats.pass || 0) / stats.total) * 100)}%</span>
                        )}
                      </div>
                    )}
                    {isActive ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isActive && activeRun?.results && (
                  <div className="border-t border-slate-100">
                    <div className="divide-y divide-slate-50">
                      {activeRun.results.map(result => {
                        const tc = result.testCase;
                        return (
                          <div key={result._id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-slate-900 truncate">{tc?.title || 'Test Case'}</p>
                              <p className="text-xs text-slate-400">{tc?.priority} priority</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'untested').map(([status, cfg]) => {
                                const Icon = cfg.icon;
                                const isSelected = result.status === status;
                                return (
                                  <button key={status} onClick={() => updateResult(tc._id, status)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${isSelected ? cfg.color : 'text-slate-400 border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <Icon className="w-3 h-3" />
                                    {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <NewRunModal projectId={projectId} suites={suites} onClose={() => setShowModal(false)} onCreated={r => setRuns(prev => [r, ...prev])} />}
    </div>
  );
}
