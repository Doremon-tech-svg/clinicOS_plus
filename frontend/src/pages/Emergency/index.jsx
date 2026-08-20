import { useState } from 'react';
import { Activity, AlertTriangle, MapPin, FileText, BarChart3, HeartPulse, HelpCircle, Wifi, Settings, Stethoscope } from 'lucide-react';
import { ROLES, STYLES } from './constants';
import { useEmergency } from './useEmergency';
import { useAuth } from '../../context/AuthContext';
import ParamedicView from './ParamedicView';
import ACCView       from './ACCView';
import DoctorView    from './DoctorView';

const sideLinks = [
  { label: 'Command Center', icon: Activity },
  { label: 'Patient Queue',  icon: AlertTriangle },
  { label: 'Routing AI',     icon: MapPin },
  { label: 'Resource Logs',  icon: FileText },
  { label: 'Analytics',      icon: BarChart3 },
];

export default function Emergency() {
  // All state lives in the hook — views just receive `em`
  const em = useEmergency();
  const { user, logout } = useAuth();
  
  // Default to the user's emergency role (from backend) or ACC if admin
  const defaultRole = user?.emergencyRole || 'ACC';
  const [role, setRole] = useState(defaultRole);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] antialiased">
      <style>{STYLES}</style>

      {/* ── Header ── */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#f9f9f9]/85 px-6 shadow-[0_4px_24px_rgba(26,28,28,0.07)] backdrop-blur-xl border-b border-[#ebbbb5]/20">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPanelOpen(p => !p)} className="text-xl font-extrabold tracking-tighter text-[#bc000c] uppercase">
            ClinicalPulse
          </button>
          <div className="h-4 w-px bg-[#e2e2e2]" />
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Connected</span>
          </div>
          {em.ambulancePos && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">
              📡 {em.gpsStatus}
            </div>
          )}
        </div>

        <nav className="hidden md:flex gap-6">
          {['Dashboard', 'Active Runs', 'Fleet', 'Dispatch'].map((l, i) => (
            <a key={l} href="#" className={`text-sm font-semibold tracking-tight ${i === 0 ? 'text-[#bc000c] border-b-2 border-[#bc000c] pb-0.5' : 'text-slate-500 hover:text-[#bc000c]'}`}>{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border border-[#ebbbb5] shadow-sm">
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  role === r.value ? 'bg-[#bc000c] text-white' : 'bg-white text-[#603e3a] hover:bg-[#fff0ee]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Wifi className="h-5 w-5 text-[#603e3a] cursor-pointer hover:text-[#bc000c]" />
          <Settings className="h-5 w-5 text-[#603e3a] cursor-pointer hover:text-[#bc000c]" />
          
          {user && (
            <div className="flex items-center gap-3 border-l border-[#ebbbb5]/40 pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800">{user.name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#bc000c]">{user.role}</div>
              </div>
              <button onClick={logout} className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold hover:bg-red-100 hover:text-red-600 transition-colors" title="Logout">
                {user.name.charAt(0)}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Sidebar ── */}
      {isPanelOpen && <button aria-label="close" onClick={() => setIsPanelOpen(false)} className="fixed inset-0 top-16 z-30 bg-black/15" />}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 bg-[#f3f3f3] flex flex-col p-4 transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 rounded-xl bg-white/80 border border-[#ebbbb5]/20 px-4 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad5]">
              <Stethoscope className="h-5 w-5 text-[#bc000c]" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest">Unit 7-Alpha</h4>
              <p className="text-[10px] font-bold text-[#bc000c] uppercase">High Priority Station</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {sideLinks.map((item, i) => (
            <a key={item.label} href="#" className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-widest transition-all ${i === 0 ? 'bg-white/80 text-[#bc000c] shadow-sm' : 'text-slate-600 hover:bg-red-50'}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest">
            <HeartPulse className="h-4 w-4" /> System Health
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="h-4 w-4" /> Help
          </a>
          <button className="mt-3 w-full rounded-xl bg-[#bc000c] py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-[#ea0012] transition-colors">
            🚨 Initiate Emergency
          </button>
        </div>
      </aside>

      {/* ── Role-based View ── */}
      {role === 'Paramedic' && <ParamedicView em={em} />}
      {role === 'ACC'       && <ACCView       em={em} />}
      {role === 'Doctor'    && <DoctorView    em={em} />}
    </div>
  );
}


