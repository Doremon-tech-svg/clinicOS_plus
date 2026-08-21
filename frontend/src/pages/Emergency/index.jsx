import { useState } from 'react';
import { Settings, User, Activity, AlertTriangle, MapPin, FileText, BarChart3, HeartPulse, HelpCircle, Stethoscope } from 'lucide-react';
import { STYLES, ROLE_VIEW } from './constants';
import { useEmergency } from './useEmergency';
import { useAuth } from '../../context/AuthContext';
import ParamedicView from './ParamedicView';
import ACCView       from './ACCView';
import ProfileModal  from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';

const sideLinks = [
  { label: 'Command Center', icon: Activity },
  { label: 'Patient Queue',  icon: AlertTriangle },
  { label: 'Routing AI',     icon: MapPin },
  { label: 'Resource Logs',  icon: FileText },
  { label: 'Analytics',      icon: BarChart3 },
];

export default function Emergency() {
  const { user, logout } = useAuth();
  const role = ROLE_VIEW[user?.role] || 'ACC'; // locked to user's real role

  // Only paramedic/acc/dispatcher/admin can access this page
  // er_doctor and dept_head are redirected from routing
  const em = useEmergency(user?.role, user?.profile_id);

  const [isPanelOpen, setIsPanelOpen]   = useState(false);
  const [showProfile, setShowProfile]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const roleLabel = {
    paramedic: '🚑 Paramedic', acc: '📡 Dispatcher',
    dispatcher: '📡 Dispatcher', admin: '⚙️ Admin',
  }[user?.role] || user?.role;

  const canDispatch = ['acc','dispatcher','admin'].includes(user?.role);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] antialiased">
      <style>{STYLES}</style>

      {/* ── Modals ── */}
      {showProfile  && <ProfileModal  user={user} onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal userRole={user?.role} onClose={() => setShowSettings(false)} />}

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

        {/* Role badge (read-only — no switcher) */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-[#ffdad5] border border-[#ebbbb5] px-4 py-2">
            <span className="text-sm font-black text-[#bc000c] uppercase tracking-widest">{roleLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(true)} className="h-9 w-9 rounded-full flex items-center justify-center text-[#603e3a] hover:bg-red-50 hover:text-[#bc000c] transition-colors" title="Settings">
            <Settings className="h-5 w-5" />
          </button>
          {user && (
            <div className="flex items-center gap-3 border-l border-[#ebbbb5]/40 pl-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800">{user.name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#bc000c]">{roleLabel}</div>
              </div>
              <button onClick={() => setShowProfile(true)}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-[#bc000c] to-[#7a0008] flex items-center justify-center text-white text-sm font-black shadow hover:shadow-md transition-all"
                title="Profile">
                {user.name.charAt(0).toUpperCase()}
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
              <h4 className="text-xs font-black uppercase tracking-widest">{user?.name}</h4>
              <p className="text-[10px] font-bold text-[#bc000c] uppercase">{roleLabel}</p>
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
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest">
            <User className="h-4 w-4" /> Profile
          </button>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="h-4 w-4" /> Help
          </a>
          <button onClick={logout} className="mt-3 w-full rounded-xl bg-slate-800 py-3 text-xs font-black uppercase tracking-widest text-white shadow hover:bg-[#bc000c] transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Role-based View (strict — no switcher) ── */}
      {role === 'Paramedic' && <ParamedicView em={em} />}
      {role === 'ACC'       && <ACCView       em={em} canEdit={canDispatch} />}
    </div>
  );
}
