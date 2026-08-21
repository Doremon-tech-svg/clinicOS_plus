import { useState, useEffect, useRef, useCallback } from "react";
import {
  INITIAL_PATIENTS, INITIAL_TASKS, INITIAL_ALERTS, INITIAL_SCHEDULE,
  ACTIVITY_LOG_INIT, VOICE_COMMANDS, DEMO_TRANSCRIPTS,
} from "./constants";
import { genHash, nowTime } from "./utils";

const BACKEND = import.meta.env.VITE_API_URL || 'https://codewizrds-deploy.onrender.com';

// AI logic is securely handled in the backend now.

// ─── CHIT-CHAT AI ─────────────────────────────────────────────────────────────
async function chatWithAI(text) {
  try {
    const res = await fetch(`${BACKEND}/api/nursing/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    return data.reply;
  } catch { 
    return "Connection failed."; 
  }
}

// ─── REPORT GENERATOR AI ──────────────────────────────────────────────────────
export async function generateRiskReport(patient) {
  const cacheKey = `report_${patient.id}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.time < 30 * 60 * 1000) return data.report;
  }

  try {
    const res = await fetch(`${BACKEND}/api/nursing/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient })
    });
    const data = await res.json();
    
    if (data.report && !data.report.includes("API Key not configured")) {
      localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), report: data.report }));
    }
    return data.report;
  } catch { 
    return "Error generating report. Check your network."; 
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
  const [rawBeds,         setRawBeds]         = useState([]);
  const [medReminderActive,setMedReminderActive] = useState(true);
  const [aiProcessing,    setAiProcessing]    = useState(false);
  const [demoIdx,         setDemoIdx]         = useState(0);

  const [voiceMode,       setVoiceMode]       = useState("action"); // 'action' or 'chat'
  const recogRef  = useRef(null);
  const toastId   = useRef(0);

  // ── Fetch real data ──
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [patientsRes, wardsRes] = await Promise.all([
          fetch(`${BACKEND}/api/nursing/patients`),
          fetch(`${BACKEND}/api/nursing/wards`),
        ]);
        const patientsData = await patientsRes.json();
        const wardsData  = await wardsRes.json();

        // Count beds based on real DB
        if (wardsData.rawBeds) {
          const total = wardsData.rawBeds.length;
          const occupied = wardsData.rawBeds.filter(b => b.status === 'Occupied').length;
          setBedCount({ total, occupied });
          setRawBeds(wardsData.rawBeds);
        }

        const merged = patientsData.patients.map(p => {
          return {
            id: p.id, name: p.name, age: p.age,
            room: p.room, bed: p.bed, ward: p.ward,
            diagnosis: p.diagnosis || "Unknown",
            risk: p.risk_score || 0,
            riskLevel: p.risk_label === "High" ? "HIGH" : p.risk_label === "Low" ? "LOW" : "MEDIUM",
            riskColor: p.risk_label === "High" ? "#e53e3e" : p.risk_label === "Low" ? "#16a34a" : "#d97706",
            riskBg: p.risk_label === "High" ? "#fff5f5" : p.risk_label === "Low" ? "#f0fdf4" : "#fffbeb",
            factors: [],
            shapValues: [],
            predictedDischarge: 3,
            dischargeText: "3 days",
            hr: p.hr || 72, bp: p.bp || "120/80",
            spo2: p.spo2 || 98, temp: p.temp || 98.6,
            weight: p.weight || 70, rr: p.rr || 16, glucose: p.glucose || 100,
            lastVitals: "Just now", meds: [], allergies: [],
            status: p.risk_label === "High" ? "Critical" : "Stable",
            admitDate: "Today",
            vitalHistory: [],
          };
        });

        merged.sort((a, b) => b.risk - a.risk);
        setPatients(merged);

        // Preserve tasks across refresh (reset daily)
        const today = new Date().toDateString();
        const savedTasksStr = localStorage.getItem("nursingTasks");
        const savedDate = localStorage.getItem("nursingTasksDate");

        if (savedTasksStr && savedDate === today) {
          setTaskList(JSON.parse(savedTasksStr));
        } else {
          const tasks = merged.filter(p => p.risk > 40).map(p => ({
            id: Date.now() + Math.random(),
            patient: p.name, room: p.room,
            desc: p.risk > 70 ? "Fall risk assessment due" : "Routine vitals check",
            priority: p.risk > 70 ? "High" : "Medium",
            priorityColor: p.risk > 70 ? "#e53e3e" : "#d97706",
            done: false, source: "AI", time: "NOW", category: "Assessment",
          }));
          setTaskList(tasks);
          localStorage.setItem("nursingTasks", JSON.stringify(tasks));
          localStorage.setItem("nursingTasksDate", today);
        }
      } catch (err) {
        console.error("Nursing fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Update Patient ──
  const updatePatient = async (id, data) => {
    try {
      await fetch(`${BACKEND}/api/nursing/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      // Refresh local state roughly
      setPatients(prev => prev.map(p => {
        if (p.id === id) {
          return { ...p, ...data, lastVitals: "Just now" };
        }
        return p;
      }));
      pushToast({ icon: "✅", title: "Patient Updated", msg: "Vitals and bed data saved to database.", color: "#16a34a" });
    } catch(e) {
      console.error(e);
      pushToast({ icon: "❌", title: "Update Failed", msg: e.message, color: "#e53e3e" });
    }
  };

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

    if (voiceMode === "chat") {
      setAiProcessing(true);
      setTranscript("Thinking...");
      const reply = await chatWithAI(text);
      setAiProcessing(false);
      setTranscript(`AI: ${reply}`);
      
      const utterance = new SpeechSynthesisUtterance(reply);
      window.speechSynthesis.speak(utterance);
      return;
    }

    // Action mode - Send directly to backend!
    setAiProcessing(true);
    let location = "—";
    const bedMatch = lower.match(/bed (\w+)|room (\w+)/);
    if (bedMatch) location = bedMatch[1] || bedMatch[2];

    try {
      const res = await fetch(`${BACKEND}/api/nursing/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: text,
          bed: location !== "—" ? location : null
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const newTask = {
          id: Date.now(), patient: location !== "—" ? `Bed ${location}` : "Ward",
          room: location !== "—" ? location : "—",
          desc: data.action, priority: "Medium",
          priorityColor: "#d97706",
          done: false, source: data.isAI ? "AI Voice" : "Voice", time: nowTime(), category: data.department,
        };
        setTaskList(prev => {
          const next = [newTask, ...prev];
          localStorage.setItem("nursingTasks", JSON.stringify(next));
          return next;
        });
        
        logActivity(data.isAI ? "Gemini AI" : "Nurse Assistant", `Voice command: "${text}" → ${data.action} → ${data.department}`, "voice", data.hash);
        setVoiceLogs(prev => [{ id: Date.now(), time: nowTime(), text, matched: data.department, action: data.action, hash: data.hash, icon: data.icon, ai: data.isAI }, ...prev.slice(0, 49)]);
        pushToast({ icon: data.icon, title: `✅ ${data.action}`, msg: `Dispatched to ${data.department}. Loc: ${location}`, color: "#2f92d0", hash: data.hash });
        setTranscript(`✅ ${data.action} → ${data.department} dept.`);
        
        if (text.includes("discharge")) {
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
    } catch (e) {
      console.error("Backend command failed", e);
      setTranscript(`⚠️ Network error processing command.`);
    } finally {
      setAiProcessing(false);
    }
  }, [patients, logActivity, pushToast, voiceMode]);

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
    aiProcessing, rawBeds, voiceMode, setVoiceMode,
    // actions
    handleMic, toggleTask, addTask,
    handleMedToggle, handleDischargeConfirm, updatePatient,
    acknowledgeAlert, dismissAlert, toggleScheduleItem,
    processVoiceCommand,
    // stats
    highRisk, pendingMeds, remaining, occupancyPct, criticalAlerts,
  };
}
