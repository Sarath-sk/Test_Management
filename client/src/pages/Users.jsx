import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { useDispatch } from 'react-redux';
import { showToast } from '../store/slices/uiSlice';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import Modal from '../components/shared/Modal';
import { formatDate, getRoleColor, capitalize } from '../utils/helpers';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tester' });
  const dispatch = useDispatch();

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUser(form);
      load();
      dispatch(showToast({ type: 'success', message: 'User created!' }));
      setModal(false);
      setForm({ name: '', email: '', password: '', role: 'tester' });
    } catch (err) { dispatch(showToast({ type: 'error', message: err.response?.data?.message || 'Failed' })); }
  };

  const handleToggleActive = async (user) => {
    await updateUser(user._id, { isActive: !user.isActive });
    load();
  };

  return (
    <Layout>
      <Header title="User Management" actions={<button className="btn-primary text-sm" onClick={() => setModal(true)}>+ Add User</button>} />
      <div className="p-6 overflow-y-auto">
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800">
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-300 text-sm font-bold">{u.name?.charAt(0)?.toUpperCase()}</div>
                      <span className="text-gray-200 font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium ${getRoleColor(u.role)}`}>{capitalize(u.role)}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs ${u.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(u)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Full Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Password *</label>
            <input type="password" className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} /></div>
          <div><label className="block text-gray-400 text-xs font-medium mb-1.5">Role</label>
            <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="tester">Tester</option>
              <option value="manager">Project Manager</option>
              <option value="admin">Admin</option>
            </select></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create User</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
