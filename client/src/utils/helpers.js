export const priorityColors = {
  critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low'
};
export const statusColors = {
  pass: 'badge-pass', fail: 'badge-fail', skip: 'badge-skip', blocked: 'badge-blocked', pending: 'badge-pending',
  draft: 'badge-pending', active: 'badge-pass', deprecated: 'badge-skip',
};
export const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const capitalize = (s) => s?.charAt(0).toUpperCase() + s?.slice(1);
export const getRoleColor = (role) => ({ admin: 'text-red-400', manager: 'text-blue-400', tester: 'text-green-400' }[role] || 'text-gray-400');
