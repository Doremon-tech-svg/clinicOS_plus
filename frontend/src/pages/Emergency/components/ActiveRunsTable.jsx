import { Loader2, Edit2, CheckCircle2 } from 'lucide-react';
import { STATUS_COLOR, SEV_DOT } from '../constants';

const NEXT_STATUS = {
  Dispatched:   'En Route',
  'En Route':   'Arrived',
  Arrived:      'Completed',
};

export default function ActiveRunsTable({ alerts, loading, onStatusChange }) {
  const active = alerts.filter(a => a.status !== 'Completed');

  if (loading && active.length === 0)
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#bc000c]" /></div>;

  return (
    <div className="glass ghost-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-widest text-slate-700">Active Runs</span>
          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{active.length}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">auto-refresh 20s</span>
      </div>

      {active.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-400">No active runs</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {active.map((a, i) => {
            const next = NEXT_STATUS[a.status];
            return (
              <div key={a.id || i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={`h-2 w-2 rounded-full shrink-0 ${SEV_DOT[a.severity] || 'bg-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-800 truncate">{a.condition_summary || a.incident}</div>
                  <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                    <span>{a.ambulance_unit || a.unit}</span>
                    {a.dispatched_location && <span>📍 {a.dispatched_location}</span>}
                    <span>ETA {a.eta_minutes || a.eta} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${STATUS_COLOR[a.status] || 'bg-slate-100 text-slate-600'}`}>
                    {a.status}
                  </span>
                  {next && onStatusChange && (
                    <button onClick={() => onStatusChange(a.id, next)}
                      className="text-[10px] font-black bg-slate-800 text-white px-2.5 py-1 rounded-lg hover:bg-[#bc000c] transition-colors flex items-center gap-1">
                      <Edit2 className="h-3 w-3" /> → {next}
                    </button>
                  )}
                  {a.status === 'Arrived' && (
                    <button onClick={() => onStatusChange(a.id, 'Completed')}
                      className="text-[10px] font-black bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
