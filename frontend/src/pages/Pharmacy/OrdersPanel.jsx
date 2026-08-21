import { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Mic, ClipboardList, AlertTriangle, Bed } from 'lucide-react';
import { PRIORITY_STYLE, STATUS_STYLE } from './constants';

function OrderCard({ o, onDispense, onReject, userId }) {
  const isVoice = o.source === 'voice';
  const isPending = o.status === 'Pending';
  return (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-3 transition-all ${isVoice ? 'border-purple-200 shadow-purple-50' : 'border-slate-200'}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {isVoice && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              <Mic className="w-2.5 h-2.5" /> Voice
            </span>
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${PRIORITY_STYLE[o.priority] || PRIORITY_STYLE.Routine}`}>
            {o.priority === 'Stat' && <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />}{o.priority}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLE[o.status] || STATUS_STYLE.Pending}`}>
            {o.status}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">#{o.id} · {new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
      </div>

      {/* Medicine */}
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-orange-500 shrink-0" />
        <div>
          <div className="font-extrabold text-slate-900">{o.medicine_name}</div>
          <div className="text-xs text-slate-500">{o.quantity} {o.unit}</div>
        </div>
      </div>

      {/* Patient + bed */}
      <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex flex-col gap-0.5">
        <div className="font-bold text-slate-800 text-sm">{o.patient_name || '—'}</div>
        <div className="flex gap-3 flex-wrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {o.bed  && <span className="flex items-center gap-1"><Bed className="w-2.5 h-2.5" />Bed {o.bed}</span>}
          {o.room && <span>Room {o.room}</span>}
          {o.ward && <span>{o.ward}</span>}
          {(o.department || o.patient_dept) && <span className="text-blue-500">{o.department || o.patient_dept}</span>}
        </div>
        {o.diagnosis && <div className="text-[10px] text-slate-400 italic mt-0.5 truncate">{o.diagnosis}</div>}
      </div>

      {/* Ordered by */}
      <div className="text-xs text-slate-400">
        🧑‍⚕️ Ordered by <span className="font-bold text-slate-600">{o.ordered_by_name || 'Ward Nurse'}</span>
        {o.notes && <span className="ml-2 italic text-slate-400">· {o.notes}</span>}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2 mt-1">
          <button onClick={() => onDispense(o.id, userId)}
            className="flex-1 h-9 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow hover:shadow-md active:scale-[0.98] transition-all">
            <CheckCircle2 className="w-3.5 h-3.5" /> Dispense
          </button>
          <button onClick={() => onReject(o.id)}
            className="h-9 w-9 rounded-xl bg-red-50 text-red-500 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {!isPending && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          {o.status === 'Dispensed'
            ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Dispensed {o.dispensed_at ? new Date(o.dispensed_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : ''}</>
            : <><XCircle className="w-3.5 h-3.5 text-red-400" />Rejected</>
          }
        </div>
      )}
    </div>
  );
}

export default function OrdersPanel({ orders, onDispense, onReject, userId }) {
  const [filter, setFilter] = useState('All');
  const [src, setSrc] = useState('All');

  const tabs = ['All', 'Pending', 'Dispensed', 'Rejected'];
  const sources = ['All', 'Voice', 'Manual'];

  const filtered = orders.filter(o => {
    const statusOk = filter === 'All' || o.status === filter;
    const srcOk    = src === 'All' || (src === 'Voice' ? o.source === 'voice' : o.source !== 'voice');
    return statusOk && srcOk;
  });

  const voiceCount = orders.filter(o => o.source === 'voice' && o.status === 'Pending').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-slate-800">Medicine Orders</h2>
          {voiceCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-full animate-pulse">
              <Mic className="w-3 h-3" /> {voiceCount} voice
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {tabs.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>
          {/* Source filter */}
          <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
            {sources.map(s => (
              <button key={s} onClick={() => setSrc(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${src === s ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-slate-400 gap-2">
          <Clock className="w-8 h-8" />
          <p className="text-sm font-bold">No orders match this filter</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(o => (
          <OrderCard key={o.id} o={o} onDispense={onDispense} onReject={onReject} userId={userId} />
        ))}
      </div>
    </div>
  );
}
