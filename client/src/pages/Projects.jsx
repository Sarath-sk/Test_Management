import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectsSlice';
import { Plus, FolderKanban, Trash2, ArrowRight, Users, TestTube2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function ProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', clientName: '', color: COLORS[0] });
  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-5">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Project Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. E-Commerce Platform" /></div>
          <div><label className="label">Client Name</label><input className="input" value={form.clientName} onChange={e => setForm(f => ({...f, clientName: e.target.value}))} placeholder="e.g. Acme Corp" /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({...f, color: c}))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const dispatch = useDispatch();
  const { list: projects, loading } = useSelector(s => s.projects);
  const user = useSelector(s => s.auth.user);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { dispatch(fetchProjects()); }, []);

  const handleCreate = async (form) => {
    const result = await dispatch(createProject(form));
    if (result.meta.requestStatus === 'fulfilled') toast.success('Project created!');
    else toast.error(result.payload);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return;
    await dispatch(deleteProject(id));
    toast.success('Project deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {['admin', 'manager'].includes(user?.role) && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No projects yet</p>
          <p className="text-slate-400 text-sm">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p._id} className="card p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: p.color || '#6366f1' }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    {p.clientName && <p className="text-xs text-slate-400">{p.clientName}</p>}
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(p._id, p.name)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {p.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1"><TestTube2 className="w-3.5 h-3.5" />{p.testCaseCount || 0} tests</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{p.members?.length || 0} members</span>
              </div>
              <Link to={`/projects/${p._id}`} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
                Open Project <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
