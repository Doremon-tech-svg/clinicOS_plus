import { Loader2, Zap, Settings } from 'lucide-react';

const FLEET_COLOR = {
  Available:   'bg-green-100 text-green-700 border-green-200',
  Busy:        'bg-red-100 text-red-700 border-red-200',
  Maintenance: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function FleetPanel({ fleet, markFleet, loading }) {
  if (loading && fleet.length === 0) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#bc000c]" /></div>;

  return (
    <div className="glass ghost-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#bc000c]" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Ambulance Fleet</h3>
        </div>
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
          {fleet.filter(f => f.status === 'Available').length} Available
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {fleet.map(unit => (
          <div key={unit.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div>
              <div className="font-bold text-sm text-slate-800">{unit.unit_name}</div>
              <div className="text-[10px] text-slate-400">
                Driver: {unit.driver_name || '—'}
                {unit.paramedic_name ? ` · ${unit.paramedic_name}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${FLEET_COLOR[unit.status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {unit.status}
              </span>
              {unit.status === 'Busy' && (
                <button
                  onClick={() => markFleet(unit.id, 'Available')}
                  className="text-[10px] font-black text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded-lg transition-colors"
                >
                  Free
                </button>
              )}
              {unit.status === 'Available' && (
                <button
                  onClick={() => markFleet(unit.id, 'Busy')}
                  className="text-[10px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors"
                >
                  Deploy
                </button>
              )}
            </div>
          </div>
        ))}
        {fleet.length === 0 && (
          <div className="px-5 py-6 text-center text-xs text-slate-400">No fleet data · Check backend</div>
        )}
      </div>
    </div>
  );
}
