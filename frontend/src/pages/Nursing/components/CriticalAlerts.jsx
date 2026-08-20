import { AlertTriangle, CheckCircle2, X, Bell } from "lucide-react";

const SEV_CONFIG = {
  critical: { color: "#e53e3e", bg: "#fff5f5", border: "#fecaca", icon: "🚨" },
  high:     { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⚠️" },
  medium:   { color: "#2f92d0", bg: "#eff6ff", border: "#bfdbfe", icon: "ℹ️" },
};

export function CriticalAlerts({ alerts, onAcknowledge, onDismiss }) {
  const unacked = alerts.filter(a => !a.acknowledged);
  const acked   = alerts.filter(a => a.acknowledged);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
          <AlertTriangle size={16} color="#e53e3e" />
          Critical Alerts
          {unacked.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "#e53e3e", borderRadius: 20, padding: "2px 8px", animation: "pulse 1.5s infinite" }}>
              {unacked.length} ACTIVE
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20, textAlign: "center" }}>
          <CheckCircle2 size={24} color="#16a34a" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>All Clear — No Active Alerts</div>
          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4 }}>All patients stable</div>
        </div>
      )}

      {unacked.map(alert => {
        const cfg = SEV_CONFIG[alert.severity] || SEV_CONFIG.medium;
        return (
          <div key={alert.id} style={{
            background: cfg.bg, border: `1.5px solid ${cfg.border}`,
            borderLeft: `4px solid ${cfg.color}`,
            borderRadius: 12, padding: "14px 16px",
            animation: alert.severity === "critical" ? "pulse 2s infinite" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{cfg.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: cfg.color }}>
                    {alert.patient} · Room {alert.room}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 3, lineHeight: 1.4 }}>{alert.message}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{alert.time} · {alert.type}</div>
                </div>
              </div>
              <button onClick={() => onDismiss(alert.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                <X size={14} color="#94a3b8" />
              </button>
            </div>
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                marginTop: 10, width: "100%", padding: "7px", borderRadius: 8,
                border: `1.5px solid ${cfg.color}`, background: "#fff",
                color: cfg.color, fontSize: 11, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
              }}
            >
              <Bell size={11} /> Acknowledge
            </button>
          </div>
        );
      })}

      {acked.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Acknowledged</div>
          {acked.map(alert => (
            <div key={alert.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", marginBottom: 6, opacity: 0.7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#64748b" }}>
                    ✓ {alert.patient} · Room {alert.room}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{alert.message}</div>
                </div>
                <button onClick={() => onDismiss(alert.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={12} color="#94a3b8" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
