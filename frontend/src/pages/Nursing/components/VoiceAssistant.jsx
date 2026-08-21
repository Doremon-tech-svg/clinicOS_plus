import { Mic, MicOff, Mic2, Loader2 } from "lucide-react";
import { WARD_COLOR, WARD_BG } from "../constants";

export function VoiceAssistant({ recording, transcript, voiceStatus, aiProcessing, onMic, onQuickCommand, voiceMode, setVoiceMode }) {
  const quickCmds = ["wheelchair", "crash cart", "discharge", "IV fluid", "oxygen", "code blue"];

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <Mic2 size={15} color={WARD_COLOR} /> Voice Assistant
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: aiProcessing ? "#d97706" : "#16a34a", background: aiProcessing ? "#fffbeb" : "#f0fdf4", border: `1px solid ${aiProcessing ? "#fde68a" : "#86efac"}`, borderRadius: 20, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
          {aiProcessing ? <><Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Processing</> : "● ONLINE"}
        </span>
      </div>

      <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 4, marginBottom: 16 }}>
        <button 
          onClick={() => setVoiceMode("chat")}
          style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.2s", background: voiceMode === "chat" ? "#fff" : "transparent", color: voiceMode === "chat" ? WARD_COLOR : "#64748b", boxShadow: voiceMode === "chat" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
          General Assistant
        </button>
        <button 
          onClick={() => setVoiceMode("action")}
          style={{ flex: 1, padding: "6px 0", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all 0.2s", background: voiceMode === "action" ? "#fff" : "transparent", color: voiceMode === "action" ? WARD_COLOR : "#64748b", boxShadow: voiceMode === "action" ? "0 1px 2px rgba(0,0,0,0.05)" : "none" }}>
          Action Commands
        </button>
      </div>

      {/* Mic button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          {recording && (
            <>
              <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: `2px solid ${WARD_COLOR}44`, animation: "ripple 1.2s ease-out infinite" }} />
              <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: `2px solid ${WARD_COLOR}22`, animation: "ripple 1.2s ease-out infinite 0.4s" }} />
            </>
          )}
          <div
            onClick={onMic}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: recording
                ? "linear-gradient(135deg,#e53e3e,#c53030)"
                : `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              boxShadow: recording ? "0 0 0 8px rgba(229,62,62,0.12)" : `0 0 0 8px ${WARD_COLOR}18`,
              transition: "all 0.25s",
            }}
          >
            {recording ? <MicOff size={28} color="#fff" /> : <Mic size={28} color="#fff" />}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 12 }}>{recording ? "Tap to stop" : "Tap to speak"}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {recording ? "🎤 Listening…" : "Powered by Gemini AI"}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div style={{ background: "#f8faff", borderRadius: 10, padding: "10px 12px", marginTop: 14, border: "1px solid #dbeafe", minHeight: 48 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>Live Transcription</div>
        <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
          <span style={{ color: WARD_COLOR, fontWeight: 700 }}>AI: </span>{transcript}
        </div>
      </div>

      {/* Voice status bar */}
      {voiceStatus !== "idle" && (
        <div style={{ marginTop: 8, height: 3, borderRadius: 3, background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: voiceStatus === "listening" ? "40%" : voiceStatus === "processing" ? "75%" : "100%",
            background: voiceStatus === "done" ? "#16a34a" : `linear-gradient(90deg,${WARD_COLOR},#1a6bbf)`,
            borderRadius: 3, transition: "width 0.5s ease",
          }} />
        </div>
      )}

      {/* Quick commands */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Quick Commands</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {quickCmds.map(cmd => (
            <button
              key={cmd}
              onClick={() => onQuickCommand(cmd)}
              style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: `1px solid ${WARD_COLOR}44`, background: WARD_BG, color: WARD_COLOR, cursor: "pointer", transition: "all 0.15s" }}
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
