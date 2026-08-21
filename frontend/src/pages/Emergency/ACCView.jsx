import {
  Mic, MicOff, Loader2, CheckCircle2, XCircle, ClipboardList,
  Keyboard, History, Shield, AlertTriangle,
} from 'lucide-react';
import { SEV_DOT, SEV_BG, SEV_TEXT } from './constants';
import FleetPanel      from './FleetPanel';
import LiveMap         from './LiveMap';
import DispatchPanel   from './components/DispatchPanel';
import ActiveRunsTable from './components/ActiveRunsTable';

export default function ACCView({ em, canEdit }) {
  const {
    conditionInput, setConditionInput, etaInput, setEtaInput,
    severity, setSeverity, additionalNotes, setAdditionalNotes,
    isListening, isProcessing, transcript, aiPrep, clinicalNote,
    aiConfidence, startVoice, stopVoice, autoFillWithAI,
    alertStatus, blockchainTx, isSending, sendEmergencyAlert,
    routeOptions, displayETA, ambulancePos, gpsETA,
    liveAlerts, dbAlerts, alertsLoading,
    fleet, markFleet, addFleet, removeFleet,
    dispatchRun, patchAlert,
  } = em;

  const alerts = dbAlerts.length > 0 ? dbAlerts : liveAlerts;

  return (
    <div className="max-w-7xl mx-auto pt-24 px-6 pb-12 space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Ambulance Command Portal</h1>
        <p className="text-slate-500 mt-1">Voice Dispatch · Live GPS · Fleet Management · Auto Alerts</p>
      </div>

      {/* Voice Section */}
      <section className="glass ghost-border rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <span className="bg-[#ffdad5] text-[#930007] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            AI Confidence: {aiConfidence}%
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <button
              onClick={isListening ? stopVoice : startVoice}
              className={`relative h-24 w-24 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-xl ${isListening ? 'bg-red-700 animate-pulse' : 'bg-[#ea0012] pulsing-red'}`}
            >
              {isProcessing ? <Loader2 className="h-10 w-10 animate-spin" /> : isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-[#bc000c]">
              {isListening ? 'Listening…' : isProcessing ? 'Processing…' : 'Click to Speak'}
            </span>
          </div>
          <div className="flex-1 w-full">
            <div className="min-h-[72px] rounded-xl border-l-4 border-[#bc000c] bg-[#f3f3f3] p-5">
              {transcript
                ? <p className="text-lg font-medium">"{transcript}"</p>
                : <p className="text-lg text-gray-400">Describe the patient's condition. AI auto-triages and dispatches.</p>
              }
            </div>
            {aiPrep.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-amber-700" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-800">Hospital Prep Checklist</span>
                </div>
                <ul className="space-y-1">
                  {aiPrep.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />{item}
                    </li>
                  ))}
                </ul>
                {clinicalNote && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-white/60 p-3 text-sm italic text-amber-900">
                    <span className="font-bold not-italic">Nurse note: </span>{clinicalNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Manual Entry + Active Runs + Alert Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Manual Entry */}
          <section className="glass ghost-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="h-4 w-4 text-[#603e3a]" />
              <h2 className="text-sm font-black uppercase tracking-widest">Manual Dispatch Entry</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#603e3a] mb-1">Patient Condition</label>
                <input
                  value={conditionInput}
                  onChange={e => setConditionInput(e.target.value)}
                  onBlur={e => e.target.value && !transcript && autoFillWithAI(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#e2e2e2] border-none px-3 text-sm focus:ring-2 focus:ring-[#bc000c]/20"
                  placeholder="e.g. Chest Pain, Trauma…"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#603e3a] mb-1">ETA (min)</label>
                <input
                  type="number" value={etaInput} onChange={e => setEtaInput(e.target.value)}
                  className="h-11 w-full rounded-xl bg-[#e2e2e2] border-none px-3 text-sm focus:ring-2 focus:ring-[#bc000c]/20"
                  placeholder="8"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#603e3a] mb-1">Severity</label>
                <div className="flex gap-1 bg-[#e2e2e2] rounded-xl p-1">
                  {['Critical', 'Moderate', 'Stable'].map(opt => (
                    <button key={opt} onClick={() => setSeverity(opt)}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-colors ${severity === opt ? 'bg-[#bc000c] text-white' : 'text-[#603e3a] hover:bg-[#d5d5d5]'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <textarea rows={2} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
                  className="w-full rounded-xl bg-[#e2e2e2] border-none p-3 text-sm resize-none focus:ring-2 focus:ring-[#bc000c]/20"
                  placeholder="Allergies, prior history, medications…" />
              </div>
            </div>
          </section>

          {/* Active Runs */}
          <ActiveRunsTable alerts={alerts} loading={alertsLoading} onStatusChange={(id, status) => patchAlert(id, status)} />

          {/* Live Alert Feed */}
          <section className="glass ghost-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ebbbb5]/20 bg-[#f3f3f3]">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#bc000c]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-[#603e3a]">Alert History</h2>
              </div>
              {alertsLoading && <Loader2 className="h-4 w-4 animate-spin text-[#bc000c]" />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-[#956d68]">
                    <th className="px-5 py-3">Incident</th><th className="px-5 py-3">Unit</th>
                    <th className="px-5 py-3">Location</th><th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">ETA</th><th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8]">
                  {alerts.length === 0 && !alertsLoading && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No alerts yet</td></tr>
                  )}
                  {alerts.filter(a => a.status === 'Completed').slice(0, 10).map((a, i) => (
                    <tr key={a.id || i} className="hover:bg-[#ffdad5]/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 shrink-0 rounded-full ${SEV_DOT[a.severity] || 'bg-slate-400'}`} />
                          <span className="font-bold text-sm">{a.condition_summary || a.incident}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{a.ambulance_unit || a.unit}</td>
                      <td className="px-5 py-3 text-xs text-slate-500 max-w-[120px] truncate">{a.dispatched_location || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${SEV_BG[a.severity] || ''} ${SEV_TEXT[a.severity] || ''}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-black text-[#bc000c]">{a.eta_minutes || a.eta} min</td>
                      <td className="px-5 py-3 text-xs text-[#603e3a]">
                        {a.dispatched_at ? new Date(a.dispatched_at).toLocaleTimeString() : a.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Dispatch + Map + Fleet */}
        <div className="space-y-4">
          {/* Diagnosis preview */}
          <div className="glass ghost-border rounded-2xl border-l-4 border-[#bc000c] p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#bc000c] mb-1">Diagnosis Preview</div>
            <h2 className="text-xl font-extrabold text-slate-800 leading-tight truncate">{conditionInput || 'Awaiting input…'}</h2>
            {severity && <span className={`mt-1 inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${SEV_BG[severity]} ${SEV_TEXT[severity]}`}>{severity}</span>}
            <div className="mt-3 text-right">
              <div className="text-3xl font-black text-[#bc000c]">{displayETA}</div>
              <div className="text-[10px] font-black uppercase text-[#603e3a]">{ambulancePos ? 'GPS ETA' : 'ETA'}</div>
            </div>
            <div className="mt-3 space-y-2">
              {routeOptions.map((r, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg bg-white p-2.5 ${r.muted ? 'opacity-30' : ''}`}>
                  <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${r.dot}`} /><span className="text-xs font-bold">{r.name}</span></div>
                  <span className={`text-[10px] font-black uppercase ${r.text}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Send button */}
          <div className="space-y-2">
            <button onClick={() => sendEmergencyAlert()} disabled={isSending}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ea0012] to-[#bc000c] text-white shadow-xl shadow-red-200 transition-all hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
              {isSending
                ? <><Loader2 className="h-6 w-6 animate-spin" /><span className="text-sm font-black uppercase tracking-widest">Sending…</span></>
                : <><AlertTriangle className="h-6 w-6" /><span className="text-sm font-black uppercase tracking-widest">Send Emergency Alert</span></>
              }
            </button>
            {alertStatus === 'success' && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-3 flex gap-2 items-start">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-green-800">Alert Dispatched! Departments notified.</p>
                  {blockchainTx && <p className="text-[10px] font-mono text-green-600 flex gap-1 mt-1"><Shield className="h-3 w-3" /> {blockchainTx.slice(0,14)}…{blockchainTx.slice(-6)}</p>}
                </div>
              </div>
            )}
            {alertStatus === 'error' && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex gap-2 items-start">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700">Send Failed · Check backend</p>
              </div>
            )}
          </div>

          {/* Dispatch Panel */}
          <DispatchPanel fleet={fleet} onDispatch={dispatchRun} />

          {/* Live Map */}
          <LiveMap ambulancePos={ambulancePos} gpsETA={gpsETA} />

          {/* Fleet */}
          <FleetPanel
            fleet={fleet} markFleet={markFleet}
            addFleet={addFleet} removeFleet={removeFleet}
            canEdit={canEdit}
          />
        </div>
      </div>
    </div>
  );
}
