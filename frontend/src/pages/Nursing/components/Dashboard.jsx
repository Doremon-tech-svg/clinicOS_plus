import { Activity, Stethoscope, CheckCircle2, AlertTriangle, Bed, RefreshCw, Plus, Loader2 } from "lucide-react";
import { WARD_COLOR } from "../constants";
import { VoiceAssistant } from "./VoiceAssistant";
import { TaskPanel } from "./TaskPanel";
import { PatientCard } from "./PatientCard";
import { CriticalAlerts } from "./CriticalAlerts";

function StatCard({ label, value, color, bg, border }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", textAlign: "center", flex: 1, minWidth: 70 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export function Dashboard({
  patients, taskList, alerts, loading,
  highRisk, pendingMeds, remaining, occupancyPct, criticalAlerts, bedCount,
  recording, transcript, voiceStatus, aiProcessing,
  handleMic, processVoiceCommand, toggleTask, addTask,
  handleMedToggle, onExplain, onDischarge, onEdit,
  acknowledgeAlert, dismissAlert,
  setActiveTab, voiceMode, setVoiceMode
}) {
  const handleQuick = (cmd) => {
    processVoiceCommand(cmd);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Page title + stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: 0 }}>
            Nurse Station <span style={{ color: WARD_COLOR }}>— Blue Zone</span>
          </h1>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatCard label="Occupancy" value={`${occupancyPct}%`} color={WARD_COLOR}     bg="#eff6ff" border="#bfdbfe" />
          <StatCard label="High Risk"  value={highRisk}          color="#e53e3e"          bg="#fff5f5" border="#fecaca" />
          <StatCard label="Pending Meds" value={pendingMeds}     color="#d97706"          bg="#fffbeb" border="#fde68a" />
          <StatCard label="Free Beds"  value={bedCount.total - bedCount.occupied} color="#16a34a" bg="#f0fdf4" border="#bbf7d0" />
          {criticalAlerts > 0 && <StatCard label="Alerts" value={criticalAlerts} color="#e53e3e" bg="#fff5f5" border="#fecaca" />}
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts > 0 && (
        <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", animation: "pulse 3s infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color="#e53e3e" />
            <span style={{ fontWeight: 700, fontSize: 13, color: "#e53e3e" }}>{criticalAlerts} Critical Alert{criticalAlerts > 1 ? "s" : ""} Require Immediate Attention</span>
          </div>
          <button onClick={() => setActiveTab("critical")} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#e53e3e", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            View Alerts →
          </button>
        </div>
      )}

      {/* Main 3-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 300px", gap: 16, alignItems: "start" }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <VoiceAssistant
            recording={recording} transcript={transcript}
            voiceStatus={voiceStatus} aiProcessing={aiProcessing}
            onMic={handleMic} onQuickCommand={handleQuick}
            voiceMode={voiceMode} setVoiceMode={setVoiceMode}
          />
          <TaskPanel taskList={taskList} remaining={remaining} onToggle={toggleTask} onAdd={addTask} />
        </div>

        {/* CENTER — patients */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
              <Stethoscope size={16} color={WARD_COLOR} /> Patient Overview
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "2px 8px" }}>{patients.length} active</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                <RefreshCw size={11} /> Refresh
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: WARD_COLOR, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                <Plus size={11} /> Admit
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 60 }}>
              <Loader2 size={32} color={WARD_COLOR} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : patients.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>No patients found</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Check backend connection</div>
            </div>
          ) : (
            patients.map(p => (
              <PatientCard
                key={p.id} patient={p}
                onDischarge={() => onDischarge(p)}
                onExplain={() => onExplain(p)}
                onMedToggle={handleMedToggle}
                onEdit={() => onEdit(p)}
              />
            ))
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Med reminder toggle */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>⏰ Med Reminders</div>
              <div style={{ fontSize: 10, color: "#b45309" }}>{pendingMeds} pending</div>
            </div>
            <button
              onClick={() => {}}
              style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, border: "none", background: "#d97706", color: "#fff", cursor: "pointer" }}
            >
              ON
            </button>
          </div>
          {/* Critical alerts */}
          <CriticalAlerts alerts={alerts} onAcknowledge={acknowledgeAlert} onDismiss={dismissAlert} />
        </div>
      </div>
    </div>
  );
}
