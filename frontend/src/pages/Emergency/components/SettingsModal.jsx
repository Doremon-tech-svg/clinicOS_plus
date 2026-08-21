import { useState } from 'react';

const ROLE_SETTINGS = {
  paramedic:  ['GPS Tracking', 'Voice Sensitivity', 'Auto-report on Arrival'],
  acc:        ['Auto-refresh Interval', 'Alert Sound', 'Desktop Notifications'],
  dispatcher: ['Auto-refresh Interval', 'Alert Sound', 'Desktop Notifications'],
  admin:      ['Fleet Auto-sort', 'Alert Sound', 'Desktop Notifications'],
};

export default function SettingsModal({ userRole, onClose }) {
  const roleOptions = ROLE_SETTINGS[userRole] || [];
  const [toggles, setToggles] = useState(() => Object.fromEntries(roleOptions.map(k => [k, true])));
  const [refresh, setRefresh] = useState('15');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative slide-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold leading-none">×</button>

        <h3 className="text-base font-black text-slate-800 mb-5">
          {userRole === 'paramedic' ? '🚑 Paramedic' : userRole === 'admin' ? '⚙️ Admin' : '📡 Dispatcher'} Settings
        </h3>

        <div className="space-y-3">
          {roleOptions.map(label => (
            <div key={label} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-slate-700">{label}</span>
              <button onClick={() => setToggles(t => ({ ...t, [label]: !t[label] }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${toggles[label] ? 'bg-[#bc000c]' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${toggles[label] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}

          {/* Dispatcher-specific refresh interval */}
          {['acc','dispatcher'].includes(userRole) && (
            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
              <span className="text-sm font-bold text-slate-700">Refresh Every</span>
              <select value={refresh} onChange={e => setRefresh(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 h-7 outline-none">
                {['5','10','15','30','60'].map(v => <option key={v} value={v}>{v}s</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="mt-5 bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-400">
          <span className="font-bold text-slate-500">Session:</span> 12-hour JWT · Auto-logout on expiry
        </div>

        <button onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-black uppercase tracking-widest hover:bg-[#bc000c] transition-colors">
          Save & Close
        </button>
      </div>
    </div>
  );
}
