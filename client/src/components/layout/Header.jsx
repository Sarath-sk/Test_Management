import React from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  const user = useSelector(s => s.auth.user);
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search test cases, projects..." className="input pl-9" />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
