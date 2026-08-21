import { useState } from 'react';
import { MapPin, Send, Loader2, ChevronDown } from 'lucide-react';
import { FLEET_COLOR } from '../constants';

export default function DispatchPanel({ fleet, onDispatch }) {
  const [location, setLocation]       = useState('');
  const [ambulanceId, setAmbulanceId] = useState('');
  const [condition, setCondition]     = useState('');
  const [eta, setEta]                 = useState('10');
  const [severity, setSeverity]       = useState('Moderate');
  const [sending, setSending]         = useState(false);
  const [sent, setSent]               = useState(false);

  // Available units first
  const sorted = [...fleet].sort((a, b) => {
    if (a.status === 'Available' && b.status !== 'Available') return -1;
    if (a.status !== 'Available' && b.status === 'Available') return 1;
    return 0;
  });

  const handleSend = async () => {
    if (!location.trim() || !ambulanceId) return;
    setSending(true);
    await onDispatch({ location, ambulance_id: Number(ambulanceId), condition, eta: Number(eta), severity });
    setSending(false); setSent(true);
    setTimeout(() => { setSent(false); setLocation(''); setAmbulanceId(''); setCondition(''); }, 3000);
  };

  return (
    <div className="glass ghost-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Send className="h-4 w-4 text-[#bc000c]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Dispatch Ambulance</h3>
      </div>

      {/* Location */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pickup Location *</label>
        <div className="flex items-center gap-2 bg-[#f3f3f3] rounded-xl px-3 h-11 border border-transparent focus-within:border-[#bc000c]/30">
          <MapPin className="h-4 w-4 text-[#bc000c] shrink-0" />
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. 12 Nehru Place, New Delhi"
            className="bg-transparent flex-1 text-sm font-medium outline-none text-slate-800 placeholder-slate-400" />
        </div>
      </div>

      {/* Ambulance selector */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
          Select Ambulance * <span className="text-green-600 normal-case font-bold">— Available on top</span>
        </label>
        <div className="relative">
          <select value={ambulanceId} onChange={e => setAmbulanceId(e.target.value)}
            className="w-full h-11 rounded-xl bg-[#f3f3f3] border border-transparent focus:border-[#bc000c]/30 px-3 pr-8 text-sm font-bold text-slate-800 outline-none appearance-none">
            <option value="">Choose ambulance…</option>
            {sorted.map(u => (
              <option key={u.id} value={u.id} disabled={u.status !== 'Available'}>
                {u.status === 'Available' ? '🟢' : u.status === 'Busy' ? '🔴' : '🟡'} {u.unit_name} ({u.vehicle_type}) — {u.driver_name || 'No driver'}
                {u.status !== 'Available' ? ` [${u.status}]` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Condition + ETA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Condition</label>
          <input value={condition} onChange={e => setCondition(e.target.value)}
            placeholder="e.g. Chest pain"
            className="h-10 w-full rounded-xl bg-[#f3f3f3] px-3 text-sm font-medium outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ETA (min)</label>
          <input type="number" value={eta} onChange={e => setEta(e.target.value)} min="1"
            className="h-10 w-full rounded-xl bg-[#f3f3f3] px-3 text-sm font-medium outline-none" />
        </div>
      </div>

      {/* Severity */}
      <div className="flex gap-1 bg-[#e2e2e2] rounded-xl p-1">
        {['Critical','Moderate','Stable'].map(opt => (
          <button key={opt} onClick={() => setSeverity(opt)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-colors ${severity === opt ? 'bg-[#bc000c] text-white' : 'text-[#603e3a] hover:bg-[#d5d5d5]'}`}>
            {opt}
          </button>
        ))}
      </div>

      <button onClick={handleSend} disabled={sending || !location || !ambulanceId}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#ea0012] to-[#bc000c] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transition-all active:scale-[0.98]">
        {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
          : sent   ? '✅ Ambulance Dispatched!'
          : <><Send className="h-4 w-4" /> Send Ambulance</>}
      </button>
    </div>
  );
}
