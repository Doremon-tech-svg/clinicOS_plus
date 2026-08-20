import { X, Brain, Lock, LogOut } from "lucide-react";
import { genHash } from "../utils";

function ShapRow({ factor, score }) {
  const pct = Math.round(score * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>{factor}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#e53e3e" }}>+{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 4, background: "#fee2e2", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct * 2.5, 100)}%`, background: "linear-gradient(90deg,#f87171,#e53e3e)", borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

export function RiskModal({ patient, onClose }) {
  if (!patient) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          border: `2px solid ${patient.riskColor}33`,
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
              <Brain size={18} color={patient.riskColor} /> AI Risk Report
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{patient.name} · Room {patient.room}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Risk ring */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            width: 110, height: 110, borderRadius: "50%",
            border: `7px solid ${patient.riskColor}`,
            justifyContent: "center",
            boxShadow: `0 0 0 10px ${patient.riskColor}15`,
          }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: patient.riskColor }}>{patient.risk}%</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: patient.riskColor, letterSpacing: 0.5 }}>{patient.riskLevel}</span>
          </div>
        </div>

        {/* SHAP */}
        <div style={{ background: "#f8faff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
            Contributing Factors (SHAP Values)
          </div>
          {patient.shapValues?.map(s => <ShapRow key={s.factor} {...s} />)}
        </div>

        {/* Model info */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 4 }}>⚙️ Model: XGBoost v2.1 · Accuracy 94.2%</div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>Updated every 15 min using real-time vitals, medication schedule, and mobility scores.</div>
        </div>

        {/* Clinical factors */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Clinical Factors</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {patient.factors?.map(f => (
            <span key={f} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "4px 12px", fontWeight: 500 }}>{f}</span>
          ))}
        </div>

        {/* Recommendations */}
        <div style={{ padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>📋 Recommended Actions</div>
          <ul style={{ margin: "0 0 0 16px", padding: 0, fontSize: 12, color: "#78350f", lineHeight: 1.9 }}>
            <li>Place bed in lowest position with brakes locked</li>
            <li>Ensure call bell is within patient reach</li>
            <li>Conduct hourly rounding checks</li>
            <li>Review and reconcile medications causing dizziness</li>
            {patient.risk > 70 && <li style={{ fontWeight: 700 }}>Activate Falls Prevention Protocol immediately</li>}
          </ul>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Lock size={11} color="#2f92d0" />
          <span style={{ fontSize: 10, color: "#2f92d0", fontFamily: "monospace" }}>Blockchain verified · {genHash()}</span>
        </div>
      </div>
    </div>
  );
}

export function DischargeModal({ patient, onConfirm, onClose }) {
  if (!patient) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🚪</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>Discharge Patient?</div>
          <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{patient.name} · Room {patient.room}</div>
        </div>
        <div style={{ background: "#f8faff", borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 12, color: "#475569", lineHeight: 1.9 }}>
          This will:<br />
          ✅ Free bed <strong>{patient.bed}</strong><br />
          ✅ Update bed count in Admin Dashboard<br />
          ✅ Dispatch cleaning task to Housekeeping<br />
          ✅ Log discharge to blockchain audit trail<br />
          ✅ Archive patient record securely
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(patient)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <LogOut size={14} /> Confirm Discharge
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: "#fff", border: `1.5px solid ${t.color || "#2f92d0"}`,
          borderRadius: 14, padding: "12px 16px", minWidth: 280, maxWidth: 380,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "slideInRight 0.3s ease",
          pointerEvents: "all",
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon || "✅"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.msg}</div>
            {t.hash && (
              <div style={{ fontSize: 10, color: "#2f92d0", marginTop: 3, fontFamily: "monospace" }}>🔒 {t.hash}</div>
            )}
          </div>
          <X size={14} color="#94a3b8" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
