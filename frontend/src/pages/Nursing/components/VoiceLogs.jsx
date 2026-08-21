import { Mic2, Filter } from "lucide-react";
import { actTypeColor, actTypeIcon } from "../utils";
import { WARD_COLOR } from "../constants";

export function VoiceLogs({ voiceLogs, activityLog }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <Mic2 size={16} color={WARD_COLOR} /> Voice Logs & Activity
      </div>

      {/* Voice Commands */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          🎙 Voice Commands ({voiceLogs.length})
        </div>
        {voiceLogs.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: "20px 0" }}>
            No voice commands recorded yet. Use the mic to get started.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {voiceLogs.map(log => (
            <div key={log.id} style={{
              background: "#f8faff", border: "1px solid #dbeafe",
              borderRadius: 10, padding: "10px 12px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{log.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>"{log.text}"</span>
                  {log.ai && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#7c3aed", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "1px 6px" }}>GEMINI AI</span>
                  )}
                </div>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{log.time}</span>
              </div>
              <div style={{ fontSize: 11, color: "#475569" }}>→ {log.action}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, fontFamily: "monospace" }}>
                Dept: <strong style={{ color: WARD_COLOR }}>{log.matched}</strong> · Hash: {log.hash}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          📋 System Activity Log ({activityLog.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflowY: "auto" }}>
          {activityLog.map(entry => (
            <div key={entry.id} style={{
              display: "flex", gap: 10, padding: "8px 10px",
              borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{actTypeIcon[entry.type] || "📝"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: actTypeColor[entry.type] || "#64748b" }}>{entry.agent}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0, marginLeft: 8 }}>{entry.time}</span>
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2, lineHeight: 1.4 }}>{entry.action}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" }}>🔒 {entry.hash}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
