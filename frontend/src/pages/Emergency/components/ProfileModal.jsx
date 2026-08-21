// Role-aware Profile Modal for Emergency dept staff
export default function ProfileModal({ user, onClose }) {
  const roleLabel = {
    paramedic:  '🚑 Paramedic',
    acc:        '📡 Dispatcher (ACC)',
    dispatcher: '📡 Dispatcher',
    admin:      '⚙️ Admin',
  }[user?.role] || user?.role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative slide-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xl font-bold leading-none">×</button>

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#bc000c] to-[#7a0008] flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{user?.name || 'Staff Member'}</div>
            <div className="text-xs font-bold uppercase text-[#bc000c] tracking-widest mt-0.5">{roleLabel}</div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          {[
            ['Email',       user?.email       || '—'],
            ['Role',        user?.role        || '—'],
            ['Hospital ID', user?.hospital_id || '—'],
            ['Staff ID',    user?.profile_id  || '—'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between bg-slate-50 rounded-xl px-4 py-2.5">
              <span className="text-slate-400 font-bold">{label}</span>
              <span className="font-bold text-slate-700 truncate ml-2 max-w-[180px]">{val}</span>
            </div>
          ))}
        </div>

        <button onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-black uppercase tracking-widest hover:bg-[#bc000c] transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}
