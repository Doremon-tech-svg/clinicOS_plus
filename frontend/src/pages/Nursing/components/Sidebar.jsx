import {
  LayoutDashboard, Activity, CheckSquare, Mic2, Calendar, Bed,
  AlertTriangle, User, Settings, HelpCircle, X, Stethoscope,
  Heart, Shield,
} from "lucide-react";
import { WARD_COLOR, WARD_BG } from "../constants";

const NAV = [
  { id: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { id: "patients",   label: "Patients",        icon: Stethoscope },
  { id: "vitals",     label: "Vitals Monitor",  icon: Activity },
  { id: "tasks",      label: "Tasks",           icon: CheckSquare },
  { id: "schedule",   label: "Schedule",        icon: Calendar },
  { id: "ward",       label: "Ward View",       icon: Bed },
  { id: "voicelogs",  label: "Voice Logs",      icon: Mic2 },
  { id: "critical",   label: "Critical Alerts", icon: AlertTriangle },
];

const NAV_BOTTOM = [
  { id: "profile",  label: "Profile",  icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support",  label: "Support",  icon: HelpCircle },
];

export function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, criticalAlerts }) {
  const NavItem = ({ item }) => (
    <div
      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
        cursor: "pointer",
        borderRadius: "0 10px 10px 0", marginRight: 10,
        background: activeTab === item.id ? WARD_BG : "transparent",
        color: activeTab === item.id ? WARD_COLOR : "#64748b",
        fontWeight: activeTab === item.id ? 700 : 500,
        fontSize: 13, transition: "all 0.15s",
        borderLeft: activeTab === item.id ? `3px solid ${WARD_COLOR}` : "3px solid transparent",
        position: "relative",
      }}
    >
      <item.icon size={15} />
      {item.label}
      {item.id === "critical" && criticalAlerts > 0 && (
        <span style={{
          marginLeft: "auto", fontSize: 9, fontWeight: 900, color: "#fff",
          background: "#e53e3e", borderRadius: 20, padding: "1px 6px",
          animation: "pulse 1.5s infinite",
        }}>{criticalAlerts}</span>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 40 }} />
      )}

      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: 234,
        background: "#fff", display: "flex", flexDirection: "column",
        borderRight: "1px solid #e2e8f0",
        zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
      }}>
        {/* Logo */}
        <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={14} color="#fff" />
            </div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#1e293b" }}>ClinicalPulseOS</div>
          </div>
          <X size={16} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSidebarOpen(false)} />
        </div>

        {/* Nurse badge */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>N</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>Nurse Station Alpha</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>Ward 4B · Blue Zone</div>
          </div>
        </div>

        {/* Main nav */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", padding: "6px 18px 4px" }}>Main</div>
          {NAV.map(item => <NavItem key={item.id} item={item} />)}

          <div style={{ margin: "10px 18px 4px", height: 1, background: "#f1f5f9" }} />
          <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", padding: "4px 18px 4px" }}>Account</div>
          {NAV_BOTTOM.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* Critical alert button */}
        <div style={{ padding: "12px 14px" }}>
          {criticalAlerts > 0 && (
            <button
              onClick={() => { setActiveTab("critical"); setSidebarOpen(false); }}
              style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#e53e3e,#c53030)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, justifyContent: "center", animation: "pulse 2s infinite" }}>
              <AlertTriangle size={14} /> {criticalAlerts} Critical Alert{criticalAlerts > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* HIPAA badge */}
        <div style={{ padding: "10px 18px 14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
          <Shield size={11} color="#16a34a" />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>HIPAA Compliant</span>
        </div>
      </aside>
    </>
  );
}
