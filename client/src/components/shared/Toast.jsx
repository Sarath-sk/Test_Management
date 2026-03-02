import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../../store/slices/uiSlice';
import { useEffect } from 'react';

export default function Toast() {
  const { toast } = useSelector(s => s.ui);
  const dispatch = useDispatch();
  useEffect(() => {
    if (toast) { const t = setTimeout(() => dispatch(hideToast()), 3500); return () => clearTimeout(t); }
  }, [toast]);
  if (!toast) return null;
  const colors = { success: 'bg-emerald-900 border-emerald-700 text-emerald-200', error: 'bg-red-900 border-red-700 text-red-200', info: 'bg-blue-900 border-blue-700 text-blue-200' };
  return (
    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg border text-sm font-medium shadow-xl ${colors[toast.type] || colors.info}`}>
      {toast.message}
    </div>
  );
}
