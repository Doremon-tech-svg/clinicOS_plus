import { useState } from 'react';
import { CheckCircle2, XCircle, UserPlus, Clock, Loader2 } from 'lucide-react';
import { SEV_BG, SEV_TEXT, SEV_DOT, STATUS_COLOR } from './constants';

function AlertCard({ alert, doctors, nurses, onAcknowledge, onAssign, onArrived }) {
  const [assignDoctor, setAssignDoctor] = useState('');
  const [assignNurse, setAssignNurse]   = useState('');

  return (
    <div className={`rounded-2xl border-l-4 p-5 bg-white shadow-sm ${
      alert.severity === 'Critical' ? 'border-red-500' : alert.severity === 'Moderate' ? 'border-amber-400' : 'border-green-400'
    }`}>
      {/* Top row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`h-2 w-2 rounded-full ${SEV_DOT[alert.severity] || 'bg-slate-400'}`} />
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${SEV_BG[alert.severity] || ''} ${SEV_TEXT[alert.severity] || ''}`}>
              {alert.severity}
            </span>
            <span className="text-[10px] font-bold text-slate-500">{alert.ambulance_unit || alert.unit}</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
            {alert.condition_summary || alert.incident}
          </h3>
          {alert.clinical_note && (
            <p className="mt-1 text-xs text-slate-500 italic">{alert.clinical_note}</p>
          )}
        </div>
        <div className="text-right ml-4 shrink-0">
          <div className="text-3xl font-black text-[#bc000c]">{alert.eta_minutes || alert.eta}</div>
          <div className="text-[10px] font-black uppercase text-slate-400">min ETA</div>
        </div>
      </div>

      {/* Departments */}
      {(alert.departments?.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {alert.departments.map((d, i) => (
            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
              {i === 0 ? '● Primary: ' : '○ '}{d}
            </span>
          ))}
        </div>
      )}

      {/* Prep checklist */}
      {alert.preparation?.length > 0 && (
        <div className="mb-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Prep Checklist</div>
          {alert.preparation.map((p, i) => <div key={i} className="text-xs text-amber-900 flex gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />{p}</div>)}
        </div>
      )}

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${STATUS_COLOR[alert.status] || 'bg-slate-100 text-slate-600'}`}>
          {alert.status}
        </span>
        <span className="text-[10px] text-slate-400">{alert.dispatched_at ? new Date(alert.dispatched_at).toLocaleTimeString() : alert.time}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {alert.status === 'Dispatched' && (
          <button onClick={() => onAcknowledge(alert.id)} className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Acknowledge Alert
          </button>
        )}
        {(alert.status === 'Acknowledged' || alert.status === 'En Route') && (
          <>
            <div className="flex gap-1 col-span-2">
              <select
                value={assignDoctor}
                onChange={e => setAssignDoctor(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-2 rounded-xl"
              >
                <option value="">Assign Doctor…</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization || d.department})</option>)}
              </select>
              <button
                onClick={() => assignDoctor && onAssign(alert.id, assignDoctor, null)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 rounded-xl transition-colors"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-1 col-span-2">
              <select
                value={assignNurse}
                onChange={e => setAssignNurse(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-2 rounded-xl"
              >
                <option value="">Assign Nurse…</option>
                {nurses.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <button
                onClick={() => assignNurse && onAssign(alert.id, null, assignNurse)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 rounded-xl transition-colors"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => onArrived(alert.id)} className="col-span-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" /> Mark Patient Arrived
            </button>
          </>
        )}
        {alert.status === 'Arrived' && (
          <button onClick={() => onArrived(alert.id, 'Completed')} className="col-span-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-black py-2.5 rounded-xl transition-colors">
            ✓ Complete Handoff
          </button>
        )}
      </div>
    </div>
  );
}

export default function DoctorView({ em }) {
  const { dbAlerts, liveAlerts, alertsLoading, doctors, nurses, patchAlert } = em;

  // Merge DB alerts (real) with live (AI-generated feed)
  const combined = dbAlerts.length > 0 ? dbAlerts : liveAlerts;

  const onAcknowledge = (id) => patchAlert(id, 'Acknowledged');
  const onAssign      = (id, doctorId, nurseId) => patchAlert(id, 'En Route', doctorId ? { assigned_doctor_id: doctorId } : {});
  const onArrived     = (id, status = 'Arrived') => patchAlert(id, status);

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">ER Receiving Bay</h1>
        <p className="text-slate-500 mt-1">Incoming alert management · Acknowledge · Assign · Confirm arrival</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Alerts', val: combined.filter(a => a.status !== 'Completed').length, color: 'text-red-600' },
          { label: 'Acknowledged',  val: combined.filter(a => a.status === 'Acknowledged' || a.status === 'En Route').length, color: 'text-purple-600' },
          { label: 'Arrived',       val: combined.filter(a => a.status === 'Arrived').length, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="glass ghost-border rounded-2xl p-4 text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert cards */}
      {alertsLoading && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#bc000c]" /></div>}
      {!alertsLoading && combined.length === 0 && (
        <div className="glass ghost-border rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🟢</div>
          <div className="font-bold text-slate-600">No active incoming alerts</div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combined.filter(a => a.status !== 'Completed').map((alert, i) => (
          <AlertCard
            key={alert.id || i}
            alert={alert}
            doctors={doctors}
            nurses={nurses}
            onAcknowledge={onAcknowledge}
            onAssign={onAssign}
            onArrived={onArrived}
          />
        ))}
      </div>

      {/* Completed */}
      {combined.filter(a => a.status === 'Completed').length > 0 && (
        <details className="glass ghost-border rounded-2xl p-4">
          <summary className="text-xs font-black uppercase tracking-widest text-slate-400 cursor-pointer">Completed Handoffs ({combined.filter(a => a.status === 'Completed').length})</summary>
          <div className="mt-3 space-y-2">
            {combined.filter(a => a.status === 'Completed').map((a, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-700">{a.condition_summary || a.incident}</span>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">DONE</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
