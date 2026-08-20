import { Activity, Wind, TrendingUp, Thermometer, Droplet } from "lucide-react";
import { WARD_COLOR } from "../constants";

function Sparkline({ data, color = WARD_COLOR }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120, h = 36, pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / range) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r={3} fill={color} />
    </svg>
  );
}

function VitalCard({ icon: Icon, label, value, unit, trend, sparkData, color, alert }) {
  return (
    <div style={{
      background: alert ? "#fff5f5" : "#fff",
      border: `1.5px solid ${alert ? "#fecaca" : "#e2e8f0"}`,
      borderRadius: 14, padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: alert ? `0 0 0 2px #e53e3e22` : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
            <Icon size={14} color={alert ? "#e53e3e" : color} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: alert ? "#e53e3e" : "#1e293b", lineHeight: 1 }}>
            {value}
            <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8", marginLeft: 3 }}>{unit}</span>
          </div>
          {trend && (
            <div style={{ fontSize: 10, color: trend > 0 ? "#e53e3e" : "#16a34a", marginTop: 3, fontWeight: 600 }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)} from last
            </div>
          )}
        </div>
        {alert && (
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "#e53e3e", borderRadius: 20, padding: "2px 8px", animation: "pulse 1.5s infinite" }}>ALERT</span>
        )}
      </div>
      {sparkData && <Sparkline data={sparkData} color={alert ? "#e53e3e" : color} />}
    </div>
  );
}

export function VitalsView({ patients }) {
  const highRiskPts = patients.filter(p => p.risk > 70);
  const allPts = patients;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
        <Activity size={16} color={WARD_COLOR} /> Vitals Monitor
      </div>

      {/* High risk vitals summary */}
      {highRiskPts.length > 0 && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#e53e3e", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            🚨 High-Risk Patients — Immediate Attention
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {highRiskPts.map(p => (
              <div key={p.id} style={{ background: "#fff", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{p.name} · Room {p.room}</div>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: "#e53e3e", borderRadius: 20, padding: "2px 8px" }}>{p.risk}% RISK</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "HR", value: p.hr, unit: "bpm", alert: p.hr > 100 },
                    { label: "SpO₂", value: p.spo2, unit: "%", alert: p.spo2 < 95 },
                    { label: "BP", value: p.bp, unit: "", alert: false },
                    { label: "Temp", value: p.temp, unit: "°F", alert: p.temp > 100.4 },
                    ...(p.glucose ? [{ label: "Glucose", value: p.glucose, unit: "mg/dL", alert: p.glucose > 200 }] : []),
                  ].map(v => (
                    <div key={v.label} style={{ background: v.alert ? "#fff5f5" : "#f8faff", border: `1px solid ${v.alert ? "#fecaca" : "#dbeafe"}`, borderRadius: 8, padding: "6px 10px" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8" }}>{v.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: v.alert ? "#e53e3e" : "#1e293b" }}>
                        {v.value}<span style={{ fontSize: 9, color: "#94a3b8" }}>{v.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All vitals table */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
          All Patients — Vitals Summary
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Patient", "Room", "HR (bpm)", "BP", "SpO₂ (%)", "Temp (°F)", "Glucose", "RR", "Last Updated", "Risk"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPts.map((p, idx) => (
                <tr key={p.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{p.name}</td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#64748b" }}>{p.room}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: p.hr > 100 ? "#e53e3e" : "#1e293b" }}>{p.hr}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e293b", whiteSpace: "nowrap" }}>{p.bp}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: p.spo2 < 95 ? "#e53e3e" : "#16a34a" }}>{p.spo2}%</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: p.temp > 100.4 ? "#e53e3e" : "#1e293b" }}>{p.temp}°</span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.glucose > 200 ? "#e53e3e" : "#1e293b" }}>{p.glucose || "—"}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e293b" }}>{p.rr || "—"}</td>
                  <td style={{ padding: "10px 12px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{p.lastVitals}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: p.riskColor, borderRadius: 20, padding: "2px 8px" }}>{p.riskLevel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
