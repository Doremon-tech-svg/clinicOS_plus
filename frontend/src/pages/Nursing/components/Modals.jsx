import { useState, useEffect } from "react";
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

import { generateRiskReport } from "../useNursing";

export function RiskModal({ patient, onClose }) {
  const [report, setReport] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setReport("");
    setGenerating(false);
  }, [patient]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await generateRiskReport(patient);
    setReport(res);
    setGenerating(false);
  };

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
              <Brain size={18} color={patient.riskColor} /> Fall Risk Assessment
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

        {/* AI Report Section */}
        <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: report ? 12 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <Brain size={14} /> AI Discharge Prediction
            </div>
            {!report && (
              <button 
                onClick={handleGenerate} disabled={generating}
                style={{ padding: "6px 12px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
                {generating ? "Generating..." : "Generate Report"}
              </button>
            )}
          </div>
          {report && (
            <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6 }}>
              {report}
            </div>
          )}
        </div>

        {/* SHAP */}
        <div style={{ background: "#f8faff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
            Contributing Factors (SHAP Values)
          </div>
          {patient.shapValues?.map(s => <ShapRow key={s.factor} {...s} />)}
        </div>

        {/* Recommendations */}
        <div style={{ padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", marginBottom: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>📋 Recommended Actions</div>
          <ul style={{ margin: "0 0 0 16px", padding: 0, fontSize: 12, color: "#78350f", lineHeight: 1.9 }}>
            <li>Place bed in lowest position with brakes locked</li>
            <li>Ensure call bell is within patient reach</li>
            <li>Conduct hourly rounding checks</li>
            <li>Review and reconcile medications causing dizziness</li>
            {patient.risk > 70 && <li style={{ fontWeight: 700 }}>Activate Falls Prevention Protocol immediately</li>}
          </ul>
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


export function EditPatientModal({ patient, availableBeds, onConfirm, onClose }) {
  if (!patient) return null;
  const [form, setForm] = useState({
    hr: patient.hr || '', bp: patient.bp || '', spo2: patient.spo2 || '',
    temp: patient.temp || '', glucose: patient.glucose || '', bed_id: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13, marginBottom: 12 };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{ background: "#fff", borderRadius: 20, padding: 24, maxWidth: 350, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>Update Patient</div>
          <X size={16} color="#64748b" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{patient.name}</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>HR (bpm)</label><input name="hr" value={form.hr} onChange={handleChange} style={inputStyle} type="number" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>BP (mmHg)</label><input name="bp" value={form.bp} onChange={handleChange} style={inputStyle} placeholder="120/80" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>SpO2 (%)</label><input name="spo2" value={form.spo2} onChange={handleChange} style={inputStyle} type="number" /></div>
          <div><label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Temp (°F)</label><input name="temp" value={form.temp} onChange={handleChange} style={inputStyle} type="number" step="0.1" /></div>
          <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Glucose (mg/dL)</label><input name="glucose" value={form.glucose} onChange={handleChange} style={inputStyle} type="number" /></div>
          
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>Assign New Bed (Optional)</label>
            <select name="bed_id" value={form.bed_id} onChange={handleChange} style={{ ...inputStyle, background: "#f8faff" }}>
              <option value="">-- Keep Current Bed ({patient.bed}) --</option>
              {availableBeds?.map(b => (
                <option key={b.id} value={b.id}>Bed {b.bed_number} (Room {b.room_id})</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={() => onConfirm(patient.id, form)} 
          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#2f92d0", color: "#fff", fontWeight: 700, cursor: "pointer", marginTop: 8 }}
        >
          Save Updates
        </button>
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
