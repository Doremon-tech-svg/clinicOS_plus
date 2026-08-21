import { useState } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

// Quick voice commands for paramedics
const QUICK_CMDS = [
  { label: 'En Route',        cmd: 'en route to patient' },
  { label: 'Patient Reached', cmd: 'patient reached' },
  { label: 'Transporting',    cmd: 'transporting patient to hospital' },
  { label: 'Return to Base',  cmd: 'returning to base' },
];

export default function VoiceAssistant({ onCommand, isListening, isProcessing, transcript, onStart, onStop }) {
  const [lastCmd, setLastCmd] = useState('');

  const runCmd = (cmd) => {
    setLastCmd(cmd);
    onCommand(cmd);
  };

  return (
    <div className="glass ghost-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-[#bc000c]" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Voice Assistant</h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Hands-Free</span>
      </div>

      {/* Big voice button */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-red-400/40 animate-ping" />
              <div className="absolute -inset-4 rounded-full border-2 border-red-300/20 animate-ping [animation-delay:300ms]" />
            </>
          )}
          <button onClick={isListening ? onStop : onStart}
            className={`relative h-20 w-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
              isListening ? 'bg-red-700' : 'bg-[#bc000c] pulsing-red'
            }`}>
            {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" />
              : isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-[#bc000c]">
          {isListening ? 'Listening…' : isProcessing ? 'Processing…' : 'Tap to Speak'}
        </span>
        {transcript && (
          <div className="w-full rounded-xl bg-[#fff5f5] border-l-4 border-[#bc000c] p-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#bc000c] mb-1">Heard</div>
            <p className="text-sm font-medium text-slate-700">"{transcript}"</p>
          </div>
        )}
        {lastCmd && !transcript && (
          <div className="text-[10px] font-bold text-green-600">✓ Sent: {lastCmd}</div>
        )}
      </div>

      {/* Quick commands */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Status</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_CMDS.map(q => (
            <button key={q.label} onClick={() => runCmd(q.cmd)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#ffdad5] hover:text-[#bc000c] text-slate-700 text-xs font-black uppercase tracking-tight transition-colors text-left">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
