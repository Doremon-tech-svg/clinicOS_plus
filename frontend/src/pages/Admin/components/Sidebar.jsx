import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Crown, Activity, Settings, Users, LayoutGrid, CalendarDays, Brain } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutGrid },
    { id: 'shifts', label: 'Duty & Shifts', icon: CalendarDays },
    { id: 'approvals', label: 'Approvals', icon: Users },
    { id: 'departments', label: 'Departments', icon: Activity },
    { id: 'staff', label: 'Staff Roster', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 text-slate-300 font-['Manrope'] z-40">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
        <Crown className="w-6 h-6 text-[#EC9A04] mr-3" />
        <span className="font-black text-white text-lg tracking-tight">Admin<span className="text-[#EC9A04]">Portal</span></span>
      </div>
      
      <div className="p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Main Menu</div>
        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? 'bg-[#EC9A04] text-white shadow-lg shadow-amber-500/20' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Logged in as</div>
        <div className="font-bold text-white text-sm mb-1 truncate">{user?.name || 'Administrator'}</div>
        <div className="text-xs font-bold text-[#EC9A04] uppercase tracking-widest truncate">{user?.hospital_name || 'Hospital'}</div>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <button
          onClick={logout}
          className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white transition-all"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
