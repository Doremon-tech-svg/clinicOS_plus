import { useState, useEffect } from 'react';
import { Siren, Loader2, CheckCircle2 } from 'lucide-react';
import { API } from '../../../config/api';

const STATUS_COLOR = {
  Dispatched:   'bg-blue-100 text-blue-700',
  'En Route':   'bg-amber-100 text-amber-700',
  Arrived:      'bg-green-100 text-green-700',
  Completed:    'bg-slate-100 text-slate-500',
};

export default function ERPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API.base}/api/ambulance/alerts`);
        const d = await res.json();
        setAlerts((d.alerts || []).filter(a => a.status !== 'Completed').slice(0, 10));
      } catch {} finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Siren className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-black text-slate-800">ER Receiving Bay</h2>
        <span className="ml-auto text-[10px] font-bold uppercase text-slate-400">Live · auto-refresh 15s</span>
      </div>

      {loading && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>}

      {!loading && alerts.length === 0 && (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
          <p className="text-sm font-bold">No active incoming patients</p>
        </div>
      )}

      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex gap-4 items-start">
            <div className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${a.severity === 'Critical' ? 'bg-red-500' : a.severity === 'Moderate' ? 'bg-amber-400' : 'bg-green-500'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-slate-800 text-sm truncate">{a.condition_summary}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] || 'bg-slate-100 text-slate-500'}`}>{a.status}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex gap-3 flex-wrap">
                <span>🚑 {a.ambulance_unit || '—'}</span>
                {a.dispatched_location && <span>📍 {a.dispatched_location}</span>}
                <span className="font-bold text-red-600">ETA {a.eta_minutes} min</span>
                <span>{a.severity}</span>
              </div>
              {a.preparation?.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {a.preparation.slice(0,3).map((p, i) => (
                    <li key={i} className="text-[11px] text-amber-800 flex gap-1">
                      <span className="text-amber-500">▸</span>{p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
