import { useState } from "react";
import { Activity, TrendingUp, Wind, Thermometer, ChevronDown, ChevronUp,
  AlertTriangle, Pill, Brain, LogOut, RefreshCw } from "lucide-react";
import { WARD_COLOR } from "../constants";

function VitalBadge({ icon: Icon, label, value, unit, color = WARD_COLOR, alert = false }) {
  return (
    <div style={{
      background: alert ? "#fff5f5" : "#f8faff",
      border: `1px solid ${alert ? "#fca5a5" : "#dbeafe"}`,
      borderRadius: 10, padding: "8px 12px",
      display: "flex", flexDirection: "column", gap: 2, minWidth: 72,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Icon size={11} color={alert ? "#e53e3e" : color} />
        <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: alert ? "#e53e3e" : "#1e293b", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8", marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

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

export function PatientCard({ patient, onDischarge, onExplain, onMedToggle }) {
  const [expanded, setExpanded] = useState(false);
  const alertVitals = patient.spo2 < 95 || patient.hr > 100 || patient.risk > 70;

  return (
    <div style={{
      border: `1.5px solid ${patient.riskColor}44`,
      borderLeft: `4px solid ${patient.riskColor}`,
      borderRadius: 14, background: patient.riskBg,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: patient.risk > 70 ? `0 0 0 2px ${patient.riskColor}22` : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `linear-gradient(135deg, ${patient.riskColor}cc, ${patient.riskColor}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>
            {patient.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{patient.name}</span>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
                color: "#fff", background: patient.riskColor,
                borderRadius: 20, padding: "2px 8px",
              }}>{patient.riskLevel}</span>
              {patient.risk > 70 && (
                <span style={{ animation: "pulse 1.5s infinite" }}>
                  <AlertTriangle size={13} color="#e53e3e" />
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              {patient.age}y · Room {patient.room} · {patient.diagnosis}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
              Admitted: {patient.admitDate} · Est. discharge: {patient.dischargeText}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: patient.riskColor, lineHeight: 1 }}>{patient.risk}%</div>
            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>FALL RISK</div>
          </div>
          {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
        </div>
      </div>

      {/* Vitals row */}
      <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <VitalBadge icon={Activity}    label="HR"   value={patient.hr}   unit="bpm" alert={patient.hr > 100} />
        <VitalBadge icon={TrendingUp}  label="BP"   value={patient.bp}   unit=""    alert={parseInt(patient.bp) > 160} />
        <VitalBadge icon={Wind}        label="SpO₂" value={patient.spo2} unit="%"   alert={patient.spo2 < 95} />
        <VitalBadge icon={Thermometer} label="Temp" value={patient.temp} unit="°F"  alert={patient.temp > 100.4} />
        {patient.glucose && <VitalBadge icon={Activity} label="Gluc" value={patient.glucose} unit="mg/dL" alert={patient.glucose > 200} />}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={10} color="#94a3b8" />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>{patient.lastVitals}</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {/* Status + allergies */}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: patient.riskBg, color: patient.riskColor, border: `1px solid ${patient.riskColor}44` }}>
              Status: {patient.status}
            </span>
            {patient.allergies?.map(a => (
              <span key={a} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#fff5f5", color: "#e53e3e", border: "1px solid #fecaca" }}>
                ⚠️ {a}
              </span>
            ))}
          </div>

          {/* SHAP */}
          {patient.shapValues?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                🧠 Risk Factors (SHAP Analysis)
              </div>
              {patient.shapValues.map(s => <ShapRow key={s.factor} {...s} />)}
            </div>
          )}

          {/* Medications */}
          {patient.meds?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                💊 Medications
              </div>
              {patient.meds.map((med, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 8,
                  background: med.done ? "#f0fdf4" : "#fff",
                  border: `1px solid ${med.done ? "#bbf7d0" : "#e2e8f0"}`,
                  marginBottom: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Pill size={12} color={med.done ? "#16a34a" : WARD_COLOR} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: med.done ? "#16a34a" : "#1e293b", textDecoration: med.done ? "line-through" : "none" }}>
                        {med.name}
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Due: {med.due} · Route: {med.route}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onMedToggle(patient.id, i)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, border: "none",
                      background: med.done ? "#dcfce7" : WARD_COLOR,
                      color: med.done ? "#16a34a" : "#fff",
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {med.done ? "✓ Given" : "Mark Given"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vital history */}
          {patient.vitalHistory?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                📊 Vital Trend (Today)
              </div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {patient.vitalHistory.map((v, i) => (
                  <div key={i} style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 8, padding: "8px 10px", minWidth: 90, flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, marginBottom: 4 }}>{v.time}</div>
                    <div style={{ fontSize: 10, color: "#1e293b" }}>HR: <strong>{v.hr}</strong></div>
                    <div style={{ fontSize: 10, color: "#1e293b" }}>SpO₂: <strong>{v.spo2}%</strong></div>
                    <div style={{ fontSize: 10, color: "#1e293b" }}>BP: <strong>{v.bp}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => onExplain(patient)}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: `1.5px solid ${patient.riskColor}66`,
                background: "#fff", color: patient.riskColor,
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
              }}
            >
              <Brain size={12} /> Risk Report
            </button>
            <button
              onClick={() => onDischarge(patient)}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1.5px solid #16a34a66",
                background: "#fff", color: "#16a34a",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
              }}
            >
              <LogOut size={12} /> Discharge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
