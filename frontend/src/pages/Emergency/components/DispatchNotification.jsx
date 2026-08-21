import { MapPin, Clock, CheckCircle2, Loader2, Navigation } from 'lucide-react';
import { SEV_BG, SEV_TEXT } from '../constants';

// Shown to paramedic when dispatcher sends a run
export default function DispatchNotification({ run, onAcknowledge, onPatientReached }) {
  if (!run) return null;

  const isAcknowledged = run.status !== 'Dispatched';

  return (
    <div className={`rounded-2xl p-5 slide-in shadow-lg ${
      run.severity === 'Critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🚨</span>
        <div>
          <div className="font-black text-lg uppercase tracking-tight">Dispatch Received</div>
          <div className="text-[11px] font-bold opacity-80 uppercase tracking-widest">{run.ambulance_unit}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-black">{run.eta_minutes}</div>
          <div className="text-[10px] font-bold opacity-80">min ETA</div>
        </div>
      </div>

      {/* Location */}
      {run.dispatched_location && (
        <div className="flex items-start gap-2 bg-white/20 rounded-xl p-3 mb-3">
          <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Destination</div>
            <div className="font-bold text-base leading-tight">{run.dispatched_location}</div>
          </div>
        </div>
      )}

      {/* Condition */}
      {run.condition_summary && (
        <div className="text-sm font-medium opacity-90 mb-3">
          <span className="font-black">Condition:</span> {run.condition_summary}
          {run.severity && (
            <span className="ml-2 text-[10px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full">
              {run.severity}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {run.status === 'Dispatched' && (
          <button onClick={() => onAcknowledge(run.id)}
            className="flex-1 py-3 rounded-xl bg-white text-red-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
            <Navigation className="h-4 w-4" /> En Route
          </button>
        )}
        {(run.status === 'En Route' || run.status === 'Acknowledged') && (
          <button onClick={() => onPatientReached(run.id)}
            className="flex-1 py-3 rounded-xl bg-white text-green-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-50 transition-colors">
            <CheckCircle2 className="h-4 w-4" /> Patient Reached
          </button>
        )}
        {run.status === 'Arrived' && (
          <div className="flex-1 py-3 rounded-xl bg-white/20 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> At Patient Location
          </div>
        )}
      </div>
    </div>
  );
}
