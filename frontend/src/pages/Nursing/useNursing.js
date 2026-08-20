import { useState, useEffect, useRef, useCallback } from "react";
import {
  INITIAL_PATIENTS, INITIAL_TASKS, INITIAL_ALERTS, INITIAL_SCHEDULE,
  ACTIVITY_LOG_INIT, VOICE_COMMANDS, DEMO_TRANSCRIPTS,
} from "./constants";
import { genHash, nowTime } from "./utils";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const BACKEND = "http://localhost:8000";

// ─── processVoiceWithAI (Gemini) ──────────────────────────────────────────────
async function parseCommandWithAI(text) {
  if (!GEMINI_API_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a hospital nurse assistant AI. Parse this voice command from a nurse and return JSON only.
Voice command: "${text}"

Return this JSON structure:
{
  "department": "one of: Pharmacy, Emergency, Cleaning, Respiratory, Cardiology, Laboratory, Medical, Nurse, Admin",
  "action": "brief action description",
  "taskDesc": "task description for task list",
  "urgency": "STAT | High | Medium | Low",
  "location": "extracted room or bed number or null",
  "icon": "single relevant emoji",
  "recognized": true
}
If you cannot parse a medical command, return {"recognized": false}.
Only return JSON, no other text.`,
            }],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
        }),
      }
    );
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useNursing() {
  const [patients,        setPatients]        = useState([]);
  const [taskList,        setTaskList]        = useState([]);
  const [alerts,          setAlerts]          = useState(INITIAL_ALERTS);
  const [schedule,        setSchedule]        = useState(INITIAL_SCHEDULE);
  const [activityLog,     setActivityLog]     = useState(ACTIVITY_LOG_INIT);
  const [loading,         setLoading]         = useState(true);
  const [toasts,          setToasts]          = useState([]);
  const [recording,       setRecording]       = useState(false);
  const [transcript,      setTranscript]      = useState("Awaiting clinician input…");
  const [voiceStatus,     setVoiceStatus]     = useState("idle"); // idle|listening|processing|done
  const [voiceLogs,       setVoiceLogs]       = useState([]);
  const [time,            setTime]            = useState(nowTime());
  const [activeTab,       setActiveTab]       = useState("dashboard");
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [explainPatient,  setExplainPatient]  = useState(null);
  const [dischargePatient,setDischargePatient]= useState(null);
  const [bedCount,        setBedCount]        = useState({ total: 48, occupied: 45 });
  const [medReminderActive,setMedReminderActive] = useState(true);
  const [aiProcessing,    setAiProcessing]    = useState(false);
  const [demoIdx,         setDemoIdx]         = useState(0);

  const recogRef  = useRef(null);
  const toastId   = useRef(0);

  // ── Fetch real data ──
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [riskRes, bedRes] = await Promise.all([
          fetch(`${BACKEND}/api/patients?limit=20&offset=0`),
          fetch(`${BACKEND}/api/bed-optimizer?limit=20&offset=0`),
        ]);
        const riskData = await riskRes.json();
        const bedData  = await bedRes.json();

        const merged = riskData.patients.map(p => {
          const bedInfo = bedData.patients?.find(b => b.id === p.id) || {};
          return {
            id: p.id, name: p.name, age: p.age,
            room: p.room || p.bed, bed: p.bed,
            diagnosis: p.diagnosis || "Unknown",
            risk: p.risk_score,
            riskLevel: p.risk_label === "High" ? "HIGH" : p.risk_label === "Low" ? "LOW" : "MEDIUM",
            riskColor: p.risk_label === "High" ? "#e53e3e" : p.risk_label === "Low" ? "#16a34a" : "#d97706",
            riskBg: p.risk_label === "High" ? "#fff5f5" : p.risk_label === "Low" ? "#f0fdf4" : "#fffbeb",
            factors: p.shap_explanation?.map(e => e.feature) || [],
            shapValues: p.shap_explanation?.map(e => ({ factor: e.feature, score: e.shap_value })) || [],
            predictedDischarge: bedInfo.predicted_discharge_days || 3,
            dischargeText: bedInfo.discharge_estimate || "3 days",
            hr: p.hr || 72, bp: p.bp || "120/80",
            spo2: p.spo2 || 98, temp: p.temp || 98.6,
            weight: p.weight || 70, rr: p.rr || 16, glucose: p.glucose || 100,
            lastVitals: "Just now", meds: [], allergies: [],
            status: p.risk_label === "High" ? "Critical" : "Stable",
            admitDate: "Today",
            vitalHistory: [],
          };
        });

        setPatients(merged);
        const tasks = merged.filter(p => p.risk > 40).map(p => ({
          id: Date.now() + Math.random(),
          patient: p.name, room: p.room,
          desc: p.risk > 70 ? "Fall risk assessment due" : "Routine vitals check",
          priority: p.risk > 70 ? "High" : "Medium",
          priorityColor: p.risk > 70 ? "#e53e3e" : "#d97706",
          done: false, source: "AI", time: "NOW", category: "Assessment",
        }));
        setTaskList(tasks);
      } catch {
        setPatients(INITIAL_PATIENTS);
        setTaskList(INITIAL_TASKS);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Live clock ──
  useEffect(() => {
    const t = setInterval(() => setTime(nowTime()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Med reminder ──
  useEffect(() => {
    if (!medReminderActive) return;
    const t = setInterval(() => {
      const due = patients.flatMap(p => p.meds.filter(m => !m.done).map(m => ({ ...m, patient: p.name })));
      if (due.length > 0) {
        const m = due[Math.floor(Math.random() * due.length)];
        pushToast({ icon: "⏰", title: "Medication Reminder", msg: `${m.patient}: ${m.name} due at ${m.due}`, color: "#d97706" });
      }
    }, 30000);
    return () => clearInterval(t);
  }, [patients, medReminderActive]);

  // ── Toast helpers ──
  const pushToast = useCallback((t) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5500);
  }, []);

  const removeToast = id => setToasts(prev => prev.filter(x => x.id !== id));

  // ── Activity log ──
  const logActivity = useCallback((agent, action, type = "ai", hash = genHash()) => {
    setActivityLog(prev => [{ id: Date.now(), time: nowTime(), agent, action, type, hash }, ...prev.slice(0, 29)]);
  }, []);

  // ── Process voice command ──
  const processVoiceCommand = useCallback(async (text) => {
    const lower = text.toLowerCase();

    // Try AI parsing first
    setAiProcessing(true);
    let aiResult = await parseCommandWithAI(text);
    setAiProcessing(false);

    let matched;
    let location = "—";
    const bedMatch = lower.match(/bed (\w+)|room (\w+)/);
    if (bedMatch) location = bedMatch[1] || bedMatch[2];

    if (aiResult?.recognized) {
      const hash = genHash();
      const newTask = {
        id: Date.now(), patient: location !== "—" ? `Bed ${location}` : "Ward",
        room: location !== "—" ? location : "—",
        desc: aiResult.taskDesc, priority: aiResult.urgency === "STAT" ? "High" : aiResult.urgency,
        priorityColor: aiResult.urgency === "STAT" || aiResult.urgency === "High" ? "#e53e3e" : aiResult.urgency === "Medium" ? "#d97706" : "#2f92d0",
        done: false, source: "AI Voice", time: nowTime(), category: aiResult.department,
      };
      setTaskList(prev => [newTask, ...prev]);
      logActivity("Gemini AI", `Voice command: "${text}" → ${aiResult.action} → ${aiResult.department}`, "voice", hash);
      setVoiceLogs(prev => [{ id: Date.now(), time: nowTime(), text, matched: aiResult.department, action: aiResult.action, hash, icon: aiResult.icon, ai: true }, ...prev.slice(0, 49)]);
      pushToast({ icon: aiResult.icon, title: `✅ ${aiResult.action}`, msg: `Dispatched to ${aiResult.department}. Loc: ${location}`, color: "#2f92d0", hash });
      setTranscript(`✅ ${aiResult.action} → ${aiResult.department} dept.`);
      return;
    }

    // Fallback: keyword matching
    matched = VOICE_COMMANDS.find(vc => lower.includes(vc.keyword));
    if (matched) {
      const newTask = {
        id: Date.now(), patient: location !== "—" ? `Bed ${location}` : "Ward",
        room: location !== "—" ? location : "—",
        desc: matched.taskDesc,
        priority: matched.keyword === "crash cart" || matched.keyword === "code blue" ? "High" : "Medium",
        priorityColor: matched.keyword === "crash cart" || matched.keyword === "code blue" ? "#e53e3e" : "#d97706",
        done: false, source: "Voice", time: nowTime(), category: matched.dept,
      };
      setTaskList(prev => [newTask, ...prev]);
      const hash = genHash();
      logActivity("Nurse Assistant", `Voice: "${text}" → ${matched.action} → ${matched.dept}`, "voice", hash);
      setVoiceLogs(prev => [{ id: Date.now(), time: nowTime(), text, matched: matched.dept, action: matched.action, hash, icon: matched.icon, ai: false }, ...prev.slice(0, 49)]);
      pushToast({ icon: matched.icon, title: `✅ ${matched.action}`, msg: `Dispatched to ${matched.dept}. Loc: ${location}`, color: matched.deptColor, hash });
      setTranscript(`✅ ${matched.action} → ${matched.dept} dept. Blockchain logged.`);

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
  }, [patients, logActivity, pushToast]);

  // ── Mic ──
  const handleMic = useCallback(() => {
    if (recording) {
      try { recogRef.current?.stop(); } catch {}
      setRecording(false);
      setVoiceStatus("idle");
      setTranscript("Awaiting clinician input…");
      return;
    }
    setRecording(true);
    setVoiceStatus("listening");
    setTranscript("🎤 Listening…");

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recog = new SpeechRec();
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recogRef.current = recog;

      recog.onresult = async (e) => {
        const spoken = e.results[0][0].transcript;
        setTranscript(`Processing: "${spoken}"…`);
        setVoiceStatus("processing");
        await processVoiceCommand(spoken);
        setVoiceStatus("done");
        setRecording(false);
      };

      recog.onerror = () => useDemoCommand();
      recog.onend   = () => { if (recording) useDemoCommand(); };
      recog.start();
    } else {
      setTimeout(useDemoCommand, 2000);
    }
  }, [recording, processVoiceCommand]);

  const useDemoCommand = useCallback(() => {
    const demo = DEMO_TRANSCRIPTS[demoIdx % DEMO_TRANSCRIPTS.length];
    setDemoIdx(i => i + 1);
    setTranscript(`Processing: "${demo}"…`);
    setVoiceStatus("processing");
    setTimeout(async () => {
      await processVoiceCommand(demo);
      setVoiceStatus("done");
      setRecording(false);
    }, 800);
  }, [demoIdx, processVoiceCommand]);

  // ── Task actions ──
  const toggleTask = useCallback((id) => {
    setTaskList(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (!t.done) {
        logActivity("Nurse", `Task completed: "${t.desc}" for ${t.patient}.`, "task");
        pushToast({ icon: "✅", title: "Task Completed", msg: `${t.desc} — ${t.patient}`, color: "#16a34a" });
      }
      return { ...t, done: !t.done };
    }));
  }, [logActivity, pushToast]);

  const addTask = useCallback((task) => {
    setTaskList(prev => [{ ...task, id: Date.now(), done: false, time: nowTime() }, ...prev]);
    pushToast({ icon: "📋", title: "Task Added", msg: task.desc, color: "#2f92d0" });
  }, [pushToast]);

  // ── Med actions ──
  const handleMedToggle = useCallback((patientId, medIdx) => {
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      const meds = p.meds.map((m, i) => i === medIdx ? { ...m, done: !m.done } : m);
      if (!p.meds[medIdx].done) {
        pushToast({ icon: "💊", title: "Medication Administered", msg: `${p.meds[medIdx].name} for ${p.name}`, color: "#2f92d0" });
        logActivity("Medication Agent", `${p.name}: ${p.meds[medIdx].name} marked administered.`, "med");
      }
      return { ...p, meds };
    }));
  }, [pushToast, logActivity]);

  // ── Discharge ──
  const handleDischargeConfirm = useCallback((p) => {
    setPatients(prev => prev.filter(pt => pt.id !== p.id));
    setBedCount(prev => ({ ...prev, occupied: prev.occupied - 1 }));
    setDischargePatient(null);
    setTaskList(prev => [{
      id: Date.now(), patient: `Room ${p.room}`, room: p.room,
      desc: "Clean and prepare room after discharge",
      priority: "Medium", priorityColor: "#d97706",
      done: false, source: "Auto-Discharge", time: nowTime(), category: "Cleaning",
    }, ...prev]);
    const hash = genHash();
    logActivity("Discharge Agent", `${p.name} discharged. Bed ${p.bed} freed. Cleaning task dispatched.`, "discharge", hash);
    pushToast({ icon: "🚪", title: "Patient Discharged", msg: `${p.name} discharged. Bed ${p.bed} freed.`, color: "#16a34a", hash });
  }, [logActivity, pushToast]);

  // ── Alert actions ──
  const acknowledgeAlert = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    logActivity("Nurse", `Alert #${id} acknowledged.`, "alert");
  }, [logActivity]);

  const dismissAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // ── Schedule actions ──
  const toggleScheduleItem = useCallback((id) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  }, []);

  // ── Computed stats ──
  const highRisk    = patients.filter(p => p.risk > 70).length;
  const pendingMeds = patients.flatMap(p => p.meds.filter(m => !m.done)).length;
  const remaining   = taskList.filter(t => !t.done).length;
  const occupancyPct= Math.round((bedCount.occupied / bedCount.total) * 100);
  const criticalAlerts = alerts.filter(a => !a.acknowledged).length;

  return {
    // state
    patients, setPatients, taskList, setTaskList,
    alerts, schedule, activityLog, loading,
    toasts, removeToast, pushToast,
    recording, transcript, voiceStatus, voiceLogs,
    time, activeTab, setActiveTab, sidebarOpen, setSidebarOpen,
    explainPatient, setExplainPatient,
    dischargePatient, setDischargePatient,
    bedCount, medReminderActive, setMedReminderActive,
    aiProcessing,
    // actions
    handleMic, toggleTask, addTask,
    handleMedToggle, handleDischargeConfirm,
    acknowledgeAlert, dismissAlert, toggleScheduleItem,
    processVoiceCommand,
    // stats
    highRisk, pendingMeds, remaining, occupancyPct, criticalAlerts,
  };
}
