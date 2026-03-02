import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';
import { FolderKanban, TestTube2, PlayCircle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const PRIORITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' };
const STATUS_COLORS = { active: '#6366f1', draft: '#94a3b8', deprecated: '#f87171' };
const RUN_COLORS = { pass: '#22c55e', fail: '#ef4444', skip: '#94a3b8', blocked: '#a855f7', untested: '#e2e8f0' };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useSelector(s => s.auth.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard...</div>;

  const priorityData = stats?.priorityStats?.map(p => ({ name: p._id, value: p.count })) || [];
  const statusData = stats?.statusStats?.map(s => ({ name: s._id, value: s.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good {getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your projects</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.totals?.projects} color="bg-brand-500" />
        <StatCard icon={TestTube2} label="Test Cases" value={stats?.totals?.testCases} color="bg-emerald-500" />
        <StatCard icon={PlayCircle} label="Test Runs" value={stats?.totals?.runs} color="bg-orange-500" />
        <StatCard icon={CheckCircle2} label="Team Members" value={stats?.totals?.users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Test Cases by Priority</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {priorityData.map(entry => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pass Rate by Project */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Pass Rate by Project</h2>
          {stats?.passRateByProject?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.passRateByProject} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} className="text-xs" />
                <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                <Tooltip formatter={v => `${v.toFixed(1)}%`} />
                <Bar dataKey="passRate" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No test runs yet. Start a run to see pass rates.
            </div>
          )}
        </div>
      </div>

      {/* Recent Runs */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Test Runs</h2>
        {stats?.recentRuns?.length ? (
          <div className="space-y-3">
            {stats.recentRuns.map(run => (
              <div key={run._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-slate-800">{run.name}</p>
                  <p className="text-xs text-slate-400">{run.project?.name} · {new Date(run.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${run.status === 'completed' ? 'bg-green-100 text-green-700' : run.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {run.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-6">No test runs yet.</p>
        )}
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
