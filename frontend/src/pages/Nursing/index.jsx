import { useNursing } from "./useNursing";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { PatientCard } from "./components/PatientCard";
import { VitalsView } from "./components/VitalsView";
import { TaskPanel } from "./components/TaskPanel";
import { Schedule } from "./components/Schedule";
import { WardView } from "./components/WardView";
import { VoiceLogs } from "./components/VoiceLogs";
import { CriticalAlerts } from "./components/CriticalAlerts";
import { Profile } from "./components/Profile";
import { Settings } from "./components/Settings";
import { Support } from "./components/Support";
import { RiskModal, DischargeModal, Toast } from "./components/Modals";
import { Loader2, RefreshCw, Plus, Stethoscope } from "lucide-react";
import { WARD_COLOR } from "./constants";

export default function Nursing() {
  const ctx = useNursing();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f6ff; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideInRight { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ripple { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f0f6ff", color: "#1e293b", overflow: "hidden" }}>

        <Sidebar
          activeTab={ctx.activeTab}
          setActiveTab={ctx.setActiveTab}
          sidebarOpen={ctx.sidebarOpen}
          setSidebarOpen={ctx.setSidebarOpen}
          criticalAlerts={ctx.criticalAlerts}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Header
            time={ctx.time}
            activeTab={ctx.activeTab}
            setActiveTab={ctx.setActiveTab}
            setSidebarOpen={ctx.setSidebarOpen}
            criticalAlerts={ctx.criticalAlerts}
          />

          {/* Main scroll area */}
          <main style={{ flex: 1, overflowY: "auto", padding: "20px 22px", animation: "fadeIn 0.25s ease" }}>

            {ctx.activeTab === "dashboard" && (
              <Dashboard
                patients={ctx.patients}
                taskList={ctx.taskList}
                alerts={ctx.alerts}
                loading={ctx.loading}
                highRisk={ctx.highRisk}
                pendingMeds={ctx.pendingMeds}
                remaining={ctx.remaining}
                occupancyPct={ctx.occupancyPct}
                criticalAlerts={ctx.criticalAlerts}
                bedCount={ctx.bedCount}
                recording={ctx.recording}
                transcript={ctx.transcript}
                voiceStatus={ctx.voiceStatus}
                aiProcessing={ctx.aiProcessing}
                handleMic={ctx.handleMic}
                processVoiceCommand={ctx.processVoiceCommand}
                toggleTask={ctx.toggleTask}
                addTask={ctx.addTask}
                handleMedToggle={ctx.handleMedToggle}
                onExplain={ctx.setExplainPatient}
                onDischarge={ctx.setDischargePatient}
                acknowledgeAlert={ctx.acknowledgeAlert}
                dismissAlert={ctx.dismissAlert}
                setActiveTab={ctx.setActiveTab}
              />
            )}

            {ctx.activeTab === "patients" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                    <Stethoscope size={18} color={WARD_COLOR} /> Patients
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "2px 10px" }}>{ctx.patients.length} active</span>
                  </h2>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                      <RefreshCw size={12} /> Refresh Vitals
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "none", background: WARD_COLOR, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      <Plus size={12} /> Admit Patient
                    </button>
                  </div>
                </div>
                {ctx.loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                    <Loader2 size={32} color={WARD_COLOR} style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 14 }}>
                    {ctx.patients.map(p => (
                      <PatientCard
                        key={p.id} patient={p}
                        onDischarge={() => ctx.setDischargePatient(p)}
                        onExplain={() => ctx.setExplainPatient(p)}
                        onMedToggle={ctx.handleMedToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {ctx.activeTab === "vitals" && (
              <VitalsView patients={ctx.patients} />
            )}

            {ctx.activeTab === "tasks" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>All Tasks</h2>
                <div style={{ minHeight: 600 }}>
                  <TaskPanel taskList={ctx.taskList} remaining={ctx.remaining} onToggle={ctx.toggleTask} onAdd={ctx.addTask} />
                </div>
              </div>
            )}

            {ctx.activeTab === "schedule" && (
              <Schedule schedule={ctx.schedule} onToggle={ctx.toggleScheduleItem} />
            )}

            {ctx.activeTab === "ward" && (
              <WardView patients={ctx.patients} bedCount={ctx.bedCount} />
            )}

            {ctx.activeTab === "voicelogs" && (
              <VoiceLogs voiceLogs={ctx.voiceLogs} activityLog={ctx.activityLog} />
            )}

            {ctx.activeTab === "critical" && (
              <div style={{ maxWidth: 680 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Critical Alerts</h2>
                <CriticalAlerts
                  alerts={ctx.alerts}
                  onAcknowledge={ctx.acknowledgeAlert}
                  onDismiss={ctx.dismissAlert}
                />
              </div>
            )}

            {ctx.activeTab === "profile" && <Profile />}

            {ctx.activeTab === "settings" && (
              <Settings
                medReminderActive={ctx.medReminderActive}
                setMedReminderActive={ctx.setMedReminderActive}
              />
            )}

            {ctx.activeTab === "support" && <Support />}

          </main>
        </div>

        {/* Modals */}
        <RiskModal patient={ctx.explainPatient} onClose={() => ctx.setExplainPatient(null)} />
        <DischargeModal patient={ctx.dischargePatient} onConfirm={ctx.handleDischargeConfirm} onClose={() => ctx.setDischargePatient(null)} />

        {/* Toasts */}
        <Toast toasts={ctx.toasts} remove={ctx.removeToast} />
      </div>
    </>
  );
}
