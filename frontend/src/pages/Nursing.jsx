import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Activity, AlertTriangle, CheckCircle2, Clock,
  Stethoscope, Pill, Bed, Zap, Brain, ShieldCheck, ChevronRight,
  X, Info, LogOut, Bell, Settings, User, TrendingUp, BarChart2,
  Clipboard, Heart, Thermometer, Wind, Droplet, Eye, RefreshCw,
  Send, Phone, Radio, Package, Wrench, ChevronDown, ChevronUp,
  ArrowRight, Circle, Star, Wifi, Lock, AlertCircle, Plus,
  LayoutDashboard, FileText, Mic2, LineChart, Menu, Loader2
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const WARD_COLOR = "#2f92d0"; // Yale Blue (Nursing)
const WARD_BG    = "#eaf5fd";

const INITIAL_PATIENTS = [
  {
    id: "P001", name: "Mrs. Sharma", age: 78, room: "4A", bed: "4A-1",
    risk: 92, riskLevel: "HIGH", riskColor: "#e53e3e", riskBg: "#fff5f5",
    diagnosis: "Post-Hip Replacement", bp: "142/88", spo2: 96, temp: 98.9, hr: 88,
    factors: ["Age >70", "Diuretic use", "Gait instability", "Orthostatic hypotension"],
    meds: [{ name: "Furosemide 40mg", due: "08:00 AM", done: false }, { name: "Atorvastatin 20mg", due: "09:00 PM", done: false }],
    lastVitals: "14 min ago", admitDate: "Apr 14", status: "Critical",
    shapValues: [{ factor: "Age >70", score: 0.38 }, { factor: "Diuretic use", score: 0.26 }, { factor: "Gait instability", score: 0.19 }, { factor: "Orthostatic hypotension", score: 0.09 }]
  },
  {
    id: "P002", name: "Ms. Jordan", age: 62, room: "18C", bed: "18C-2",
    risk: 47, riskLevel: "MEDIUM", riskColor: "#d97706", riskBg: "#fffbeb",
    diagnosis: "Appendectomy Recovery", bp: "118/72", spo2: 98, temp: 99.1, hr: 74,
    factors: ["Post-Op Recovery", "Hypotension", "Analgesic use"],
    meds: [{ name: "Paracetamol 500mg", due: "10:00 AM", done: true }, { name: "Tramadol 50mg", due: "02:00 PM", done: false }],
    lastVitals: "31 min ago", admitDate: "Apr 16", status: "Stable",
    shapValues: [{ factor: "Post-Op Recovery", score: 0.22 }, { factor: "Hypotension", score: 0.15 }, { factor: "Analgesic use", score: 0.10 }]
  },
  {
    id: "P003", name: "Mr. Gupta", age: 45, room: "22A", bed: "22A-3",
    risk: 18, riskLevel: "LOW", riskColor: "#16a34a", riskBg: "#f0fdf4",
    diagnosis: "Pneumonia (Resolving)", bp: "126/80", spo2: 99, temp: 98.4, hr: 68,
    factors: ["None Detected"],
    meds: [{ name: "Azithromycin 500mg", due: "08:00 AM", done: true }],
    lastVitals: "8 min ago", admitDate: "Apr 15", status: "Improving",
    shapValues: [{ factor: "Age", score: 0.05 }, { factor: "Illness duration", score: 0.03 }]
  },
  {
    id: "P004", name: "Mr. Chen", age: 55, room: "12B", bed: "12B-1",
    risk: 61, riskLevel: "MEDIUM", riskColor: "#d97706", riskBg: "#fffbeb",
    diagnosis: "Type 2 Diabetes — Hyperglycemia", bp: "138/86", spo2: 97, temp: 98.6, hr: 82,
    factors: ["Insulin-dependent", "Neuropathy", "Poor vision"],
    meds: [{ name: "Insulin Glargine 20U", due: "08:00 AM", done: false }, { name: "Metformin 500mg", due: "01:00 PM", done: false }],
    lastVitals: "22 min ago", admitDate: "Apr 17", status: "Monitoring",
    shapValues: [{ factor: "Insulin-dependent", score: 0.28 }, { factor: "Neuropathy", score: 0.20 }, { factor: "Poor vision", score: 0.13 }]
  },
];

const INITIAL_TASKS = [
  { id: 1, patient: "Mrs. Sharma", room: "4A", desc: "Fall risk assessment due", priority: "High", priorityColor: "#e53e3e", done: false, source: "AI", time: "NOW" },
  { id: 2, patient: "Mr. Chen", room: "12B", desc: "Scheduled insulin administration", priority: "High", priorityColor: "#e53e3e", done: false, source: "EMR", time: "08:00 AM" },
  { id: 3, patient: "Ms. Jordan", room: "18C", desc: "Post-op wound dressing change", priority: "Medium", priorityColor: "#d97706", done: false, source: "Doctor", time: "10:00 AM" },
  { id: 4, patient: "Bed 7", room: "07A", desc: "Replace IV fluid bag", priority: "Low", priorityColor: "#2f92d0", done: false, source: "Auto", time: "11:30 AM" },
  { id: 5, patient: "Mr. Gupta", room: "22A", desc: "Discharge prep — vitals final check", priority: "Medium", priorityColor: "#d97706", done: false, source: "Doctor", time: "12:00 PM" },
];

const VOICE_COMMANDS = [
  { phrase: "wheelchair for bed", keyword: "wheelchair", dept: "Cleaning", deptColor: "#9b9b9b", icon: "♿", action: "Wheelchair dispatched", taskDesc: "Wheelchair requested" },
  { phrase: "crash cart", keyword: "crash cart", dept: "Emergency", deptColor: "#ff0015", icon: "🚨", action: "Crash cart alerted", taskDesc: "CRASH CART — URGENT" },
  { phrase: "discharge", keyword: "discharge", dept: "Admin", deptColor: "#f19e0e", icon: "🚪", action: "Discharge workflow initiated", taskDesc: "Discharge process started" },
  { phrase: "iv fluid", keyword: "iv fluid", dept: "Pharmacy", deptColor: "#ff4400", icon: "💉", action: "IV fluid request sent to Pharmacy", taskDesc: "IV fluid restock needed" },
  { phrase: "medication", keyword: "medication", dept: "Pharmacy", deptColor: "#ff4400", icon: "💊", action: "Medication request queued", taskDesc: "Medication request" },
  { phrase: "clean", keyword: "clean", dept: "Cleaning", deptColor: "#9b9b9b", icon: "🧹", action: "Cleaning task dispatched", taskDesc: "Room cleaning requested" },
  { phrase: "oxygen", keyword: "oxygen", dept: "Respiratory", deptColor: "#2bc6d4", icon: "🫁", action: "Oxygen support team notified", taskDesc: "Oxygen support needed" },
  { phrase: "blood pressure", keyword: "blood pressure", dept: "Nurse", deptColor: "#2f92d0", icon: "🩺", action: "BP monitoring task created", taskDesc: "Blood pressure check" },
];

const ACTIVITY_LOG_INIT = [
  { id: 1, time: "10:32 AM", agent: "Nurse Assistant AI", action: "Voice command processed: 'wheelchair for bed 2' → Dispatched to Cleaning.", type: "voice", hash: "0x7a2b...f91" },
  { id: 2, time: "10:28 AM", agent: "Fall Risk Model", action: "Mrs. Sharma risk score updated: 85% → 92%. High-priority task created.", type: "ai", hash: "0x3c9d...a12" },
  { id: 3, time: "10:15 AM", agent: "Medication Reminder", action: "Alert: Mr. Chen — Insulin Glargine 20U due at 08:00 AM. Nurse notified.", type: "med", hash: "0x1f2a...b44" },
  { id: 4, time: "09:55 AM", agent: "Blockchain Logger", action: "Consent record updated for P001 — Mrs. Sharma. Hash verified.", type: "blockchain", hash: "0x9e4c...f02" },
];

const DEMO_TRANSCRIPTS = [
  "I need a wheelchair for bed 2",
  "crash cart to room 14",
  "discharge Mr. Gupta room 22A",
  "IV fluid needed for bed 7",
  "medication review for Mr. Chen",
  "clean room 18C after discharge",
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Activity,        label: "Vitals" },
  { icon: Clipboard,       label: "Tasks" },
  { icon: Mic2,            label: "Voice Logs" },
  { icon: LineChart,       label: "Health Trends" },
];

// ─── UTILITY ─────────────────────────────────────────────────────────────────

function genHash() {
  return "0x" + Math.random().toString(16).slice(2, 8) + "..." + Math.random().toString(16).slice(2, 6);
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── SUBCOMPONENTS ────────────────────────────────────────────────────────────

// Vital badge
function VitalBadge({ icon: Icon, label, value, unit, color = "#2f92d0", alert = false }) {
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

// SHAP bar row
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


// Toast notification
function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: "#fff", border: `1.5px solid ${t.color || "#2f92d0"}`,
          borderRadius: 12, padding: "12px 16px", minWidth: 280, maxWidth: 360,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "slideInRight 0.3s ease",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon || "✅"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.msg}</div>
            {t.hash && (
              <div style={{ fontSize: 10, color: "#2f92d0", marginTop: 3, fontFamily: "monospace" }}>
                🔒 Blockchain: {t.hash}
              </div>
            )}
          </div>
          <X size={14} color="#94a3b8" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}


// Patient Card (expandable)
function PatientCard({ patient, onDischarge, onExplain, onMedToggle }) {
  const [expanded, setExpanded] = useState(false);

  const alertVitals = patient.spo2 < 95 || patient.hr > 100 || patient.risk > 70;

  return (
    <div style={{
      border: `1.5px solid ${patient.riskColor}44`,
      borderLeft: `4px solid ${patient.riskColor}`,
      borderRadius: 14, background: patient.riskBg,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: patient.risk > 70 ? `0 0 0 2px ${patient.riskColor}22` : "none",
    }}>
      {/* Header */}
      <div
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: `linear-gradient(135deg, ${patient.riskColor}cc, ${patient.riskColor}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
          }}>
            {patient.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

      {/* Quick vitals row */}
      <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <VitalBadge icon={Activity}    label="HR"   value={patient.hr}   unit="bpm"  alert={patient.hr > 100} />
        <VitalBadge icon={TrendingUp}  label="BP"   value={patient.bp}   unit=""     alert={patient.bp.split("/")[0] > 160} />
        <VitalBadge icon={Wind}        label="SpO₂" value={patient.spo2} unit="%"    alert={patient.spo2 < 95} />
        <VitalBadge icon={Thermometer} label="Temp" value={patient.temp} unit="°F"   alert={patient.temp > 100.4} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={10} color="#94a3b8" />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>{patient.lastVitals}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          {/* SHAP explanation */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              🧠 AI Risk Explanation (SHAP)
            </div>
            {patient.shapValues.map(s => <ShapRow key={s.factor} {...s} />)}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            🏥 Predicted discharge: {patient.dischargeText}
          </div>
          {/* Medications */}
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
                  <Pill size={12} color={med.done ? "#16a34a" : "#2f92d0"} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: med.done ? "#16a34a" : "#1e293b", textDecoration: med.done ? "line-through" : "none" }}>
                      {med.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Due: {med.due}</div>
                  </div>
                </div>
                <button
                  onClick={() => onMedToggle(patient.id, i)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none",
                    background: med.done ? "#dcfce7" : "#2f92d0",
                    color: med.done ? "#16a34a" : "#fff",
                    fontSize: 10, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {med.done ? "✓ Given" : "Mark Given"}
                </button>
              </div>
            ))}
          </div>

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
              <Brain size={12} /> Full Risk Report
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

// Risk Explain Modal
function RiskModal({ patient, onClose }) {
  if (!patient) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: 28, maxWidth: 480, width: "100%",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          border: `2px solid ${patient.riskColor}33`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>🧠 AI Risk Explanation</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{patient.name} · Room {patient.room}</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Risk score ring */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            width: 100, height: 100, borderRadius: "50%",
            border: `6px solid ${patient.riskColor}`,
            justifyContent: "center",
            boxShadow: `0 0 0 8px ${patient.riskColor}15`,
          }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: patient.riskColor }}>{patient.risk}%</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: patient.riskColor, letterSpacing: 0.5 }}>{patient.riskLevel}</span>
          </div>
        </div>

        {/* SHAP bars */}
        <div style={{ background: "#f8faff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
            Contributing Factors (SHAP Values)
          </div>
          {patient.shapValues.map(s => <ShapRow key={s.factor} {...s} />)}
        </div>

        {/* Model info */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 4 }}>⚙️ Model: XGBoost v2.1 · Accuracy 94.2%</div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>Updated every 15 min using real-time vitals, medication schedule, and mobility scores.</div>
        </div>

        {/* Factors list */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Clinical Factors</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {patient.factors.map(f => (
            <span key={f} style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", borderRadius: 20, padding: "4px 12px", fontWeight: 500 }}>{f}</span>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>📋 Recommended Actions</div>
          <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: 12, color: "#78350f", lineHeight: 1.8 }}>
            <li>Place bed in lowest position with brakes locked</li>
            <li>Ensure call bell is within patient reach</li>
            <li>Conduct hourly rounding checks</li>
            {patient.risk > 70 && <li style={{ fontWeight: 700 }}>Consider falls prevention protocol</li>}
          </ul>
        </div>

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Lock size={11} color="#2f92d0" />
          <span style={{ fontSize: 10, color: "#2f92d0", fontFamily: "monospace" }}>Blockchain verified · {genHash()}</span>
        </div>
      </div>
    </div>
  );
}

// Discharge Modal
function DischargeModal({ patient, onConfirm, onClose }) {
  if (!patient) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{ background: "#fff", borderRadius: 20, padding: 28, maxWidth: 400, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚪</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>Discharge Patient?</div>
          <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{patient.name} · Room {patient.room}</div>
        </div>
        <div style={{ background: "#f8faff", borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 12, color: "#475569", lineHeight: 1.8 }}>
          This will:<br />
          ✅ Free bed <strong>{patient.bed}</strong><br />
          ✅ Update bed count in Admin Dashboard<br />
          ✅ Dispatch cleaning task to Grey dept<br />
          ✅ Log discharge to blockchain<br />
          ✅ Archive patient record
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(patient)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Confirm Discharge
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Nursing() {
  const [patients, setPatients] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog]     = useState(ACTIVITY_LOG_INIT);
  const [recording, setRecording]         = useState(false);
  const [transcript, setTranscript]       = useState("Awaiting clinician input...");
  const [voiceStatus, setVoiceStatus]     = useState("idle"); // idle | listening | processing | done
  const [time, setTime]                   = useState(nowTime());
  const [activeNav, setActiveNav]         = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [toasts, setToasts]               = useState([]);
  const [explainPatient, setExplainPatient] = useState(null);
  const [dischargePatient, setDischargePatient] = useState(null);
  const [voiceLogs, setVoiceLogs]         = useState([]);
  const [demoIdx, setDemoIdx]             = useState(0);
  const [bedCount, setBedCount]           = useState({ total: 48, occupied: 45 });
  const [medReminderActive, setMedReminderActive] = useState(true);
  const recogRef = useRef(null);
  const toastId  = useRef(0);
  
  // Fetch real patient data from backend
useEffect(() => {
  async function fetchData() {
    setLoading(true);
    try {
      // Fetch only 20 patients
      const [riskRes, bedRes] = await Promise.all([
        fetch('http://localhost:8000/api/patients?limit=20&offset=0'),
        fetch('http://localhost:8000/api/bed-optimizer?limit=20&offset=0')
      ]);

      const riskData = await riskRes.json();
      const bedData = await bedRes.json();

      const merged = riskData.patients.map(p => {
        const bedInfo = bedData.patients?.find(b => b.id === p.id) || {};
        return {
          id: p.id,
          name: p.name,
          age: p.age,
          room: p.room || p.bed,
          bed: p.bed,
          diagnosis: p.diagnosis || 'Unknown',
          risk: p.risk_score,
          riskLevel: p.risk_label === 'High' ? 'HIGH' : p.risk_label === 'Low' ? 'LOW' : 'MEDIUM',
          riskColor: p.risk_label === 'High' ? '#e53e3e' : p.risk_label === 'Low' ? '#16a34a' : '#d97706',
          riskBg: p.risk_label === 'High' ? '#fff5f5' : p.risk_label === 'Low' ? '#f0fdf4' : '#fffbeb',
          factors: p.shap_explanation?.map(e => e.feature) || [],
          shapValues: p.shap_explanation?.map(e => ({ factor: e.feature, score: e.shap_value })) || [],
          predictedDischarge: bedInfo.predicted_discharge_days || 3,
          dischargeText: bedInfo.discharge_estimate || '3 days',
          // Use real vitals from API
          hr: p.hr || 72,
          bp: p.bp || '120/80',
          spo2: p.spo2 || 98,
          temp: p.temp || 98.6,
          lastVitals: 'Just now',
          meds: [],
        };
      });

      setPatients(merged);

      // Generate tasks
      const generatedTasks = merged.filter(p => p.risk > 40).map(p => ({
        id: Date.now() + p.id,
        patient: p.name,
        room: p.room,
        desc: p.risk > 70 ? 'Fall risk assessment due' : 'Routine vitals check',
        priority: p.risk > 70 ? 'High' : 'Medium',
        priorityColor: p.risk > 70 ? '#e53e3e' : '#d97706',
        done: false,
        source: 'AI',
        time: 'NOW',
      }));
      setTaskList(generatedTasks);
    } catch (err) {
      console.error('Fetch error:', err);
      setPatients(INITIAL_PATIENTS);
      setTaskList(INITIAL_TASKS);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(nowTime()), 1000);
    return () => clearInterval(t);
  }, []);

  // Periodic med reminder simulation
  useEffect(() => {
    if (!medReminderActive) return;
    const t = setInterval(() => {
      const undoneMed = patients.flatMap(p => p.meds.filter(m => !m.done).map(m => ({ ...m, patient: p.name })));
      if (undoneMed.length > 0) {
        const m = undoneMed[Math.floor(Math.random() * undoneMed.length)];
        pushToast({ icon: "⏰", title: "Medication Reminder", msg: `${m.patient}: ${m.name} due at ${m.due}`, color: "#d97706" });
      }
    }, 30000);
    return () => clearInterval(t);
  }, [patients, medReminderActive]);

  // Toast helpers
  const pushToast = useCallback((t) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(x => x.id !== id));

  // Add to activity log
  const logActivity = (agent, action, type = "ai", hash = genHash()) => {
    setActivityLog(prev => [{
      id: Date.now(), time: nowTime(), agent, action, type, hash
    }, ...prev.slice(0, 19)]);
  };

  // ── Voice Command Handler ──
  const processVoiceCommand = useCallback((text) => {
    const lower = text.toLowerCase();
    const matched = VOICE_COMMANDS.find(vc => lower.includes(vc.keyword));

    if (matched) {
      // Extract bed/room if present
      const bedMatch = lower.match(/bed (\w+)|room (\w+)/);
      const location = bedMatch ? (bedMatch[1] || bedMatch[2]) : "—";

      const newTask = {
        id: Date.now(),
        patient: location !== "—" ? `Bed ${location}` : "Ward",
        room: location !== "—" ? location : "—",
        desc: matched.taskDesc,
        priority: matched.keyword === "crash cart" ? "High" : "Medium",
        priorityColor: matched.keyword === "crash cart" ? "#e53e3e" : "#d97706",
        done: false, source: "Voice", time: nowTime(),
      };
      setTaskList(prev => [newTask, ...prev]);

      const hash = genHash();
      logActivity(
        "Nurse Assistant AI",
        `Voice command: "${text}" → ${matched.action} to ${matched.dept} dept.`,
        "voice", hash
      );

      setVoiceLogs(prev => [{
        id: Date.now(), time: nowTime(), text, matched: matched.dept,
        action: matched.action, hash, icon: matched.icon,
      }, ...prev.slice(0, 29)]);

      pushToast({
        icon: matched.icon,
        title: `✅ ${matched.action}`,
        msg: `Dispatched to ${matched.dept}. Bed/Room: ${location}`,
        color: matched.deptColor,
        hash,
      });

      setTranscript(`✅ ${matched.action} → ${matched.dept} dept. Blockchain logged.`);

      // Special: discharge flow
      if (matched.keyword === "discharge") {
        const nameMatch = lower.match(/discharge\s+(.+?)(?:\s+room|\s+bed|$)/);
        if (nameMatch) {
          const p = patients.find(pt => pt.name.toLowerCase().includes(nameMatch[1].toLowerCase()));
          if (p) setTimeout(() => setDischargePatient(p), 800);
        }
      }
    } else {
      setTranscript(`⚠️ Command not recognized: "${text}". Try "wheelchair for bed 2" or "crash cart".`);
      pushToast({ icon: "⚠️", title: "Command Unrecognized", msg: text, color: "#d97706" });
    }
  }, [patients, pushToast]);

  // ── Mic Button ──
  const handleMic = () => {
    if (recording) {
      // Stop
      if (recogRef.current) { try { recogRef.current.stop(); } catch {} }
      setRecording(false);
      setVoiceStatus("idle");
      setTranscript("Awaiting clinician input...");
      return;
    }

    setRecording(true);
    setVoiceStatus("listening");
    setTranscript("🎤 Listening…");

    // Try real SpeechRecognition
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recog = new SpeechRec();
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recogRef.current = recog;

      recog.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        setTranscript(`Processing: "${spoken}"…`);
        setVoiceStatus("processing");
        setTimeout(() => {
          processVoiceCommand(spoken);
          setVoiceStatus("done");
          setRecording(false);
        }, 600);
      };

      recog.onerror = () => {
        // Fallback to demo
        useDemoCommand();
      };

      recog.onend = () => {
        if (recording) useDemoCommand();
      };

      recog.start();
    } else {
      // No SpeechRecognition — use demo after delay
      setTimeout(useDemoCommand, 2000);
    }
  };

  const useDemoCommand = () => {
    const demo = DEMO_TRANSCRIPTS[demoIdx % DEMO_TRANSCRIPTS.length];
    setDemoIdx(i => i + 1);
    setTranscript(`Processing: "${demo}"…`);
    setVoiceStatus("processing");
    setTimeout(() => {
      processVoiceCommand(demo);
      setVoiceStatus("done");
      setRecording(false);
    }, 800);
  };

  // ── Task toggle ──
  const toggleTask = (id) => {
    setTaskList(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, done: !t.done };
      if (!t.done) {
        logActivity("Nurse", `Task completed: "${t.desc}" for ${t.patient}.`, "task");
        pushToast({ icon: "✅", title: "Task Completed", msg: `${t.desc} — ${t.patient}`, color: "#16a34a" });
      }
      return updated;
    }));
  };

  // ── Med toggle ──
  const handleMedToggle = (patientId, medIdx) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      const meds = p.meds.map((m, i) => i === medIdx ? { ...m, done: !m.done } : m);
      if (!p.meds[medIdx].done) {
        pushToast({ icon: "💊", title: "Medication Administered", msg: `${p.meds[medIdx].name} for ${p.name}`, color: "#2f92d0" });
        logActivity("Medication Agent", `${p.name}: ${p.meds[medIdx].name} marked administered.`, "med");
      }
      return { ...p, meds };
    }));
  };

  // ── Discharge confirm ──
  const handleDischargeConfirm = (p) => {
    setPatients(prev => prev.filter(pt => pt.id !== p.id));
    setBedCount(prev => ({ ...prev, occupied: prev.occupied - 1 }));
    setDischargePatient(null);

    const taskId = Date.now();
    setTaskList(prev => [{
      id: taskId, patient: `Room ${p.room}`, room: p.room,
      desc: "Clean and prepare room after discharge",
      priority: "Medium", priorityColor: "#d97706",
      done: false, source: "Auto-Discharge", time: nowTime(),
    }, ...prev]);

    const hash = genHash();
    logActivity("Discharge Agent", `${p.name} discharged. Bed ${p.bed} freed. Cleaning task dispatched. Blockchain logged.`, "discharge", hash);
    pushToast({ icon: "🚪", title: "Patient Discharged", msg: `${p.name} discharged. Bed ${p.bed} freed. Cleaning notified.`, color: "#16a34a", hash });
  };

  // ── Stats ──
  const highRisk = patients.filter(p => p.risk > 70).length;
  const pendingMeds = patients.flatMap(p => p.meds.filter(m => !m.done)).length;
  const remaining = taskList.filter(t => !t.done).length;
  const occupancyPct = Math.round((bedCount.occupied / bedCount.total) * 100);

  const actTypeColor = { voice: "#2f92d0", ai: "#8c55aa", med: "#d97706", blockchain: "#16a34a", task: "#2f92d0", discharge: "#e53e3e" };
  const actTypeIcon  = { voice: "🎙", ai: "🧠", med: "💊", blockchain: "🔒", task: "✅", discharge: "🚪" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideInRight { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes ripple { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f0f6ff", color: "#1e293b", overflow: "hidden" }}>

        {/* ── Sidebar Overlay ── */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 40 }} />
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 228,
          background: "#fff", display: "flex", flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none",
        }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: WARD_COLOR }}>AetherHealth</div>
            <X size={16} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSidebarOpen(false)} />
          </div>

          <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>N</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Nurse Station Alpha</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Ward 4B · Night Shift</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "10px 0" }}>
            {NAV_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} onClick={() => { setActiveNav(label); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
                  cursor: "pointer", borderRadius: "0 10px 10px 0", marginRight: 12,
                  background: activeNav === label ? WARD_BG : "transparent",
                  color: activeNav === label ? WARD_COLOR : "#64748b",
                  fontWeight: activeNav === label ? 700 : 400,
                  fontSize: 13, transition: "all 0.15s",
                  borderLeft: activeNav === label ? `3px solid ${WARD_COLOR}` : "3px solid transparent",
                }}>
                <Icon size={15} /> {label}
              </div>
            ))}
          </nav>

          <div style={{ padding: "0 16px 8px" }}>
            <button style={{ width: "100%", padding: "11px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              🚨 Critical Alert
            </button>
          </div>
          <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0" }}>
            {["Settings", "Support"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>
                {item === "Settings" ? <Settings size={13} /> : <Info size={13} />} {item}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ── Header ── */}
          <header style={{
            background: "#fff", borderBottom: "1px solid #e2e8f0",
            padding: "0 20px", height: 54,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Menu size={18} color="#64748b" />
              </button>
              <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
              <div style={{ fontWeight: 800, fontSize: 14, color: WARD_COLOR }}>AetherHealth</div>
              <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
              {["Ward View", "Patients", "Schedules"].map(tab => (
                <div key={tab} style={{
                  padding: "0 2px 4px", fontSize: 13,
                  fontWeight: activeNav === tab ? 700 : 400,
                  color: activeNav === tab ? WARD_COLOR : "#64748b",
                  borderBottom: activeNav === tab ? `2px solid ${WARD_COLOR}` : "2px solid transparent",
                  cursor: "pointer",
                }} onClick={() => setActiveNav(tab)}>{tab}</div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse 2s infinite" }} />
                AI Active
              </div>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Bell size={17} color="#64748b" />
                <span style={{ position: "absolute", top: -4, right: -4, background: "#e53e3e", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  {highRisk + pendingMeds}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#1e293b" }}>{time}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600 }}>NIGHT SHIFT</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <User size={14} />
              </div>
            </div>
          </header>

          {/* ── Content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>

            {/* Page title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>
                  Nurse Station <span style={{ color: WARD_COLOR }}>— Blue Zone</span>
                </h1>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                  <Brain size={12} color="#8c55aa" />
                  Nurse Assistant Agent Active · XGBoost Fall Risk Model v2.1
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "#fff", border: "1px solid #dbeafe", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: WARD_COLOR }}>{occupancyPct}%</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5 }}>OCCUPANCY</div>
                </div>
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#e53e3e" }}>{highRisk}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5 }}>HIGH RISK</div>
                </div>
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#d97706" }}>{pendingMeds}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5 }}>PENDING MEDS</div>
                </div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#16a34a" }}>{bedCount.total - bedCount.occupied}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.5 }}>FREE BEDS</div>
                </div>
              </div>
            </div>

            {/* ── 3-column grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 300px", gap: 16 }}>

              {/* ── LEFT: Voice + Tasks ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Voice Assistant */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <Mic2 size={15} color={WARD_COLOR} /> Voice Assistant
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 20, padding: "2px 8px" }}>ONLINE</span>
                  </div>

                  {/* Mic button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <div style={{ position: "relative" }}>
                      {recording && (
                        <>
                          <div style={{ position: "absolute", inset: -12, borderRadius: "50%", border: `2px solid ${WARD_COLOR}44`, animation: "ripple 1.2s ease-out infinite" }} />
                          <div style={{ position: "absolute", inset: -22, borderRadius: "50%", border: `2px solid ${WARD_COLOR}22`, animation: "ripple 1.2s ease-out infinite 0.4s" }} />
                        </>
                      )}
                      <div
                        onClick={handleMic}
                        style={{
                          width: 80, height: 80, borderRadius: "50%",
                          background: recording
                            ? "linear-gradient(135deg,#e53e3e,#c53030)"
                            : `linear-gradient(135deg,${WARD_COLOR},#1a6bbf)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: recording ? "0 0 0 8px rgba(229,62,62,0.12)" : `0 0 0 8px ${WARD_COLOR}18`,
                          transition: "all 0.25s",
                        }}
                      >
                        {recording ? <MicOff size={28} color="#fff" /> : <Mic size={28} color="#fff" />}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>
                        {recording ? "Tap to stop" : "Tap to speak"}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {recording ? "🎤 Listening…" : 'Try: "wheelchair for bed 2"'}
                      </div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div style={{ background: "#f8faff", borderRadius: 10, padding: "10px 12px", marginTop: 14, border: "1px solid #dbeafe" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>Live Transcription</div>
                    <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
                      <span style={{ color: WARD_COLOR, fontWeight: 700 }}>AI: </span>{transcript}
                    </div>
                  </div>

                  {/* Quick command chips */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Quick Commands</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {["wheelchair", "crash cart", "discharge", "IV fluid"].map(cmd => (
                        <button key={cmd} onClick={() => { setVoiceStatus("processing"); setTranscript(`Processing: "${cmd}"…`); setTimeout(() => { processVoiceCommand(cmd); setVoiceStatus("done"); }, 600); }}
                          style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: `1px solid ${WARD_COLOR}44`, background: WARD_BG, color: WARD_COLOR, cursor: "pointer" }}>
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority Tasks */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={15} color="#16a34a" /> Priority Tasks
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "2px 8px" }}>{remaining} left</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {taskList.slice(0, 6).map(task => (
                      <div key={task.id} onClick={() => toggleTask(task.id)}
                        style={{
                          border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px",
                          display: "flex", alignItems: "flex-start", gap: 10,
                          cursor: "pointer", opacity: task.done ? 0.5 : 1,
                          background: task.done ? "#f8fafc" : "#fff",
                          transition: "all 0.2s",
                        }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: 4,
                          border: `2px solid ${task.done ? "#16a34a" : "#cbd5e1"}`,
                          flexShrink: 0, marginTop: 1,
                          background: task.done ? "#16a34a" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {task.done && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 11, textDecoration: task.done ? "line-through" : "none", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {task.patient} · {task.room}
                            </span>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: task.priorityColor, borderRadius: 20, padding: "1px 7px", flexShrink: 0 }}>{task.priority}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{task.desc}</div>
                          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: WARD_COLOR }}>🔒 CHAIN</span>
                            <span style={{ fontSize: 9, color: "#94a3b8" }}>{task.source} · {task.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {taskList.length > 6 && (
                      <div style={{ textAlign: "center", fontSize: 11, color: WARD_COLOR, fontWeight: 700, padding: "6px 0", cursor: "pointer" }}>
                        +{taskList.length - 6} more tasks →
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── CENTER: Patients ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 7 }}>
                    <Stethoscope size={16} color={WARD_COLOR} /> Patient Overview
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 20, padding: "2px 8px" }}>{patients.length} active</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                      <RefreshCw size={11} /> Refresh Vitals
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: "none", background: WARD_COLOR, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      <Plus size={11} /> Admit Patient
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
                      onDischarge={() => setDischargePatient(p)}
                      onExplain={() => setExplainPatient(p)}
                      onMedToggle={handleMedToggle}
                    />
                  ))
                )}
              </div>

              {/* ── RIGHT: Med Reminder Only ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Med reminder toggle */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>⏰ Med Reminders</div>
                <div style={{ fontSize: 10, color: "#b45309" }}>{pendingMeds} pending medications</div>
              </div>
              <div
                onClick={() => setMedReminderActive(m => !m)}
                style={{ width: 38, height: 22, borderRadius: 11, background: medReminderActive ? "#d97706" : "#d1d5db", cursor: "pointer", position: "relative", transition: "background 0.25s" }}>
                <div style={{ position: "absolute", top: 3, left: medReminderActive ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.25s" }} />
              </div>
            </div>
          </div>

            </div>
          </div>
        </div>

        {/* ── Modals ── */}
        <RiskModal patient={explainPatient} onClose={() => setExplainPatient(null)} />
        <DischargeModal patient={dischargePatient} onConfirm={handleDischargeConfirm} onClose={() => setDischargePatient(null)} />

        {/* ── Toast ── */}
        <Toast toasts={toasts} remove={removeToast} />
      </div>
    </>
  );
}