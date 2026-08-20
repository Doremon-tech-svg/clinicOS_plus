import { Mic, MicOff, Loader2, CheckCircle2, ClipboardList, Navigation, Shield } from 'lucide-react';
import { SEV_BG, SEV_TEXT } from './constants';

export default function ParamedicView({ em }) {
  const {
    isListening, isProcessing, transcript, aiPrep, clinicalNote,
    alertStatus, blockchainTx, aiConfidence, severity,
    conditionInput, gpsStatus, ambulancePos, gpsETA, displayETA,
    startVoice, stopVoice, routeOptions,
  } = em;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-24 px-4 pb-12">
      {/* Header card */}
      <div className="glass ghost-border rounded-2xl p-6 text-center">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Unit 7-Alpha · Field Mode</div>
        <h1 className="text-3xl font-extrabold text-[#bc000c] tracking-tight">Paramedic Dispatch</h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-blue-600 font-bold">
          <Navigation className="h-3 w-3" /> {gpsStatus}
        </div>
      </div>

      {/* GPS ETA banner */}
      {gpsETA !== null && (
        <div className="bg-[#bc000c] text-white rounded-2xl p-4 flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-widest">GPS ETA to Hospital</span>
          <span className="text-4xl font-black">{displayETA} <span className="text-lg">min</span></span>
        </div>
      )}

      {/* Voice Button */}
      <div className="glass ghost-border rounded-2xl p-8 flex flex-col items-center gap-6">
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-red-400/40 animate-ping" />
              <div className="absolute -inset-4 rounded-full border-2 border-red-300/20 animate-ping [animation-delay:300ms]" />
            </>
          )}
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`relative h-32 w-32 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-2xl ${
              isListening ? 'bg-red-700' : 'bg-[#bc000c] pulsing-red'
            }`}
          >
            {isProcessing ? <Loader2 className="h-12 w-12 animate-spin" /> : isListening ? <MicOff className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
          </button>
        </div>
        <div className="text-center">
          <div className="font-black text-lg uppercase tracking-widest text-[#bc000c]">
            {isListening ? 'Listening…' : isProcessing ? 'AI Processing…' : 'Tap to Report Condition'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Voice auto-sends alert · AI triages in seconds</div>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full rounded-xl border-l-4 border-[#bc000c] bg-[#fff5f5] p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#bc000c] mb-1">Recorded</div>
            <p className="text-sm font-medium text-slate-700">"{transcript}"</p>
          </div>
        )}
      </div>

      {/* AI confidence badge */}
      {aiConfidence && conditionInput && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Triage Result</div>
            <div className="font-bold text-slate-800 mt-0.5">{conditionInput}</div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${SEV_BG[severity]} ${SEV_TEXT[severity]}`}>{severity}</span>
            <div className="text-[10px] text-slate-400 mt-1">{aiConfidence}% confidence</div>
          </div>
        </div>
      )}

      {/* Prep checklist */}
      {aiPrep.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-800">Hospital Prep Checklist</span>
          </div>
          <ul className="space-y-2">
            {aiPrep.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />{item}
              </li>
            ))}
          </ul>
          {clinicalNote && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 p-3 text-sm italic text-amber-900">
              <span className="font-bold not-italic">Nurse note: </span>{clinicalNote}
            </div>
          )}
        </div>
      )}

      {/* Alert status */}
      {alertStatus === 'success' && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-black text-green-800">Alert Dispatched!</span>
          </div>
          <p className="text-sm text-green-700">Departments alerted · Blockchain logged</p>
          {blockchainTx && (
            <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-green-600">
              <Shield className="h-3 w-3" /> Tx: {blockchainTx.slice(0,14)}…{blockchainTx.slice(-6)}
            </div>
          )}
          {routeOptions.filter(r => !r.muted).map((r, i) => (
            <div key={i} className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className={`h-2 w-2 rounded-full ${r.dot}`} /> {r.name} — {r.status}
            </div>
          ))}
        </div>
      )}
      {alertStatus === 'error' && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-bold">
          ✗ Send Failed · Check backend connection
        </div>
      )}
    </div>
  );
}
