import { useState } from 'react';
import { X, User, Phone, Shield, Building2, Save, CheckCircle2 } from 'lucide-react';

export default function ProfileModal({ user, onClose }) {
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [phone, setPhone]             = useState(user?.phone || '');
  const [saved, setSaved]             = useState(false);

  const handleSave = () => {
    // In a real app, patch user profile via API
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const roleLabel = {
    paramedic: '🚑 Paramedic', acc: '📡 Dispatcher (ACC)',
    dispatcher: '📡 Dispatcher', admin: '⚙️ Administrator',
    er_doctor: '🩺 ER Doctor', dept_head: '🏥 Department Head',
  }[user?.role] || user?.role;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm slide-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#bc000c] to-[#7a0008] px-6 py-8 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-black mx-auto mb-3">
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-black">{user?.name}</h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-200 mt-0.5">{roleLabel}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Display Name</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="bg-transparent flex-1 text-sm font-bold text-slate-800 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contact Phone</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91-XXXXX-XXXXX"
                className="bg-transparent flex-1 text-sm font-bold text-slate-800 outline-none" />
            </div>
          </div>

          <div className="flex gap-3 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-[#bc000c]" />{user?.email || 'N/A'}</div>
            <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3 text-[#bc000c]" />{user?.hospital_name || 'Hospital'}</div>
          </div>

          <button onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-[#bc000c] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ea0012] transition-colors">
            {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
