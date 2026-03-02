import { capitalize } from '../../utils/helpers';
export default function Badge({ value, type = 'status' }) {
  const map = {
    critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low',
    pass: 'badge-pass', fail: 'badge-fail', skip: 'badge-skip', blocked: 'badge-blocked', pending: 'badge-pending',
    draft: 'badge-pending', active: 'badge-pass', deprecated: 'badge-skip',
    planned: 'badge-pending', in_progress: 'badge-medium', completed: 'badge-pass', aborted: 'badge-fail',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[value] || 'bg-gray-700 text-gray-400'}`}>{capitalize(value?.replace('_', ' '))}</span>;
}
