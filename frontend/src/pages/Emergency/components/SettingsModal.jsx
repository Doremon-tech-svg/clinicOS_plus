import { useState } from 'react';
import { X, Bell, Map, RefreshCw, Mic, Volume2, Moon, Sun } from 'lucide-react';

function Toggle({ label, value, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-[#bc000c]' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function SettingsModal({ userRole, onClose }) {
  const [settings, setSettings] = useState({
    notifications: true, gps: true, sound: true, darkMode: false,
    autoRefresh: true, voiceSensitivity: true,
  });
  const set = (k) => (v) => setSettings(s => ({ ...s, [k]: v }));
  const isParamedic  = userRole === 'paramedic';
  const isDispatcher = ['acc', 'dispatcher', 'admin'].includes(userRole);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm slide-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">Settings</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-700" /></button>
        </div>

        <div className="px-6 py-4 space-y-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">General</p>
          <Toggle label="Push Notifications" value={settings.notifications} onChange={set('notifications')} icon={Bell} />
          <Toggle label="Sound Alerts"       value={settings.sound}         onChange={set('sound')}         icon={Volume2} />
          <Toggle label="Dark Mode"          value={settings.darkMode}      onChange={set('darkMode')}      icon={settings.darkMode ? Moon : Sun} />

          {isParamedic && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 mb-2">Paramedic</p>
              <Toggle label="GPS Tracking"       value={settings.gps}              onChange={set('gps')}              icon={Map} />
              <Toggle label="Voice Sensitivity"  value={settings.voiceSensitivity} onChange={set('voiceSensitivity')} icon={Mic} />
            </>
          )}

          {isDispatcher && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 mb-2">Dispatcher</p>
              <Toggle label="GPS Tracking"    value={settings.gps}         onChange={set('gps')}         icon={Map} />
              <Toggle label="Auto-Refresh"    value={settings.autoRefresh} onChange={set('autoRefresh')} icon={RefreshCw} />
            </>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
