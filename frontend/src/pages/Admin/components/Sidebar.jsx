import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Crown, Activity, Settings, Users, LayoutGrid, CalendarDays, Brain } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  
  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutGrid },
    { id: 'shifts', label: 'Duty & Shifts', icon: CalendarDays },
    { id: 'departments', label: 'Departments', icon: Activity },
    { id: 'staff', label: 'Staff Roster', icon: Users },
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
      
      <div className="mt-auto p-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
          <Brain className="absolute -right-4 -bottom-4 w-16 h-16 text-slate-700/30" />
          <div className="text-xs font-bold text-[#EC9A04] uppercase tracking-widest mb-1">AI Assistant</div>
          <p className="text-xs font-medium text-slate-400">Shift optimization is currently active.</p>
        </div>
      </div>
    </aside>
  );
}
