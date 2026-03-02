import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createTestCase, updateTestCase } from '../store/slices/testCasesSlice';
import api from '../api/axios';
import { Plus, Trash2, ChevronLeft, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const defaultStep = () => ({ stepNo: 1, action: '', expectedResult: '', testData: '' });

export default function TestCaseEditor() {
  const { projectId, tcId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = !!tcId;

  const [form, setForm] = useState({
    title: '', description: '', preconditions: '', priority: 'medium',
    status: 'draft', type: 'functional', tags: '', suite: searchParams.get('suiteId') || '',
    steps: [{ ...defaultStep() }]
  });
  const [suites, setSuites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/suites', { params: { projectId } }).then(r => setSuites(r.data));
    if (isEdit) {
      api.get(`/testcases/${tcId}`).then(r => {
        const tc = r.data;
        setForm({
          title: tc.title, description: tc.description || '',
          preconditions: tc.preconditions || '', priority: tc.priority,
          status: tc.status, type: tc.type,
          tags: tc.tags?.join(', ') || '', suite: tc.suite?._id || '',
          steps: tc.steps?.length ? tc.steps : [{ ...defaultStep() }]
        });
      });
    }
  }, [projectId, tcId]);

  const addStep = () => setForm(f => ({
    ...f, steps: [...f.steps, { stepNo: f.steps.length + 1, action: '', expectedResult: '', testData: '' }]
  }));

  const updateStep = (i, field, val) => setForm(f => ({
    ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
  }));

  const removeStep = (i) => setForm(f => ({
    ...f, steps: f.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNo: idx + 1 }))
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        project: projectId
      };
      if (!form.suite) return toast.error('Please select a test suite');
      const action = isEdit ? updateTestCase({ id: tcId, body }) : createTestCase(body);
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(isEdit ? 'Test case updated!' : 'Test case created!');
        navigate(`/projects/${projectId}?suiteId=${form.suite}`);
      } else toast.error(result.payload);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
        <h1 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Test Case' : 'New Test Case'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Basic Info</h2>
          <div><label className="label">Title *</label><input className="input" required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Verify user login with valid credentials" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Suite *</label>
              <select className="input" required value={form.suite} onChange={e => setForm(f => ({...f, suite: e.target.value}))}>
                <option value="">Select suite...</option>
                {suites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}>
                {['low','medium','high','critical'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                {['functional','regression','smoke','integration','performance','security'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                {['draft','active','deprecated'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="What does this test case verify?" /></div>
          <div><label className="label">Preconditions</label><textarea className="input resize-none" rows={2} value={form.preconditions} onChange={e => setForm(f => ({...f, preconditions: e.target.value}))} placeholder="System must be in logged-out state..." /></div>
          <div><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="login, auth, smoke" /></div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Test Steps</h2>
            <button type="button" onClick={addStep} className="btn-ghost text-sm py-1"><Plus className="w-3.5 h-3.5" /> Add Step</button>
          </div>
          <div className="space-y-3">
            {form.steps.map((step, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Step {step.stepNo}</span>
                  {form.steps.length > 1 && (
                    <button type="button" onClick={() => removeStep(i)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Action</label><textarea className="input resize-none text-sm" rows={2} value={step.action} onChange={e => updateStep(i, 'action', e.target.value)} placeholder="Navigate to login page" required /></div>
                  <div><label className="label">Expected Result</label><textarea className="input resize-none text-sm" rows={2} value={step.expectedResult} onChange={e => updateStep(i, 'expectedResult', e.target.value)} placeholder="Login page is displayed" required /></div>
                </div>
                <div className="mt-2"><label className="label">Test Data (optional)</label><input className="input text-sm" value={step.testData} onChange={e => updateStep(i, 'testData', e.target.value)} placeholder="username=admin@test.com" /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Test Case'}
          </button>
        </div>
      </form>
    </div>
  );
}
