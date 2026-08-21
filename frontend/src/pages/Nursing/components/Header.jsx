import { Menu, Brain, User, Zap } from "lucide-react";
import NotificationBell from "../../../components/NotificationBell";
import { WARD_COLOR } from "../constants";

export function Header({ time, activeTab, setActiveTab, setSidebarOpen, criticalAlerts }) {
  const TAB_ITEMS = ["Ward View", "Rooms", "Patients", "Schedules", "Vitals"];
  const tabMap = { "Ward View": "ward", "Rooms": "rooms", "Patients": "patients", "Schedules": "schedule", "Vitals": "vitals" };

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      zIndex: 30,
      position: "relative",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
          <Menu size={18} color="#64748b" />
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <div style={{ fontWeight: 900, fontSize: 15, color: WARD_COLOR, letterSpacing: -0.3 }}>ClinicalPulseOS</div>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <div style={{ display: "flex", gap: 2 }}>
          {TAB_ITEMS.map(tab => (
            <div key={tab}
              style={{
                padding: "0 10px", height: 56, display: "flex", alignItems: "center",
                fontSize: 13, fontWeight: activeTab === tabMap[tab] ? 700 : 400,
                color: activeTab === tabMap[tab] ? WARD_COLOR : "#64748b",
                borderBottom: activeTab === tabMap[tab] ? `2.5px solid ${WARD_COLOR}` : "2.5px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onClick={() => setActiveTab(tabMap[tab])}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {criticalAlerts > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#e53e3e", cursor: "pointer", animation: "pulse 2s infinite" }}
            onClick={() => setActiveTab("critical")}>
            🚨 {criticalAlerts} Alert{criticalAlerts > 1 ? "s" : ""}
          </div>
        )}
        <NotificationBell />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#1e293b" }}>{time}</div>
          <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Night Shift</div>
        </div>
        <div 
          onClick={() => setActiveTab("profile")}
          style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}
        >
          <User size={15} />
        </div>
      </div>
    </header>
  );
}
