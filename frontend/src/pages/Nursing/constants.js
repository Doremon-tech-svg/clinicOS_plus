// ─── NURSING MODULE CONSTANTS ─────────────────────────────────────────────────

export const WARD_COLOR = "#2f92d0";
export const WARD_DARK  = "#1a6bbf";
export const WARD_BG    = "#eaf5fd";
export const ACCENT_RED = "#e53e3e";
export const ACCENT_AMB = "#d97706";
export const ACCENT_GRN = "#16a34a";

// Navigation tabs
export const NAV_TABS = [
  { id: "dashboard",  label: "Dashboard" },
  { id: "patients",   label: "Patients" },
  { id: "vitals",     label: "Vitals" },
  { id: "tasks",      label: "Tasks" },
  { id: "schedule",   label: "Schedule" },
  { id: "ward",       label: "Ward View" },
  { id: "voicelogs",  label: "Voice Logs" },
  { id: "critical",   label: "Critical Alerts" },
  { id: "profile",    label: "Profile" },
  { id: "settings",   label: "Settings" },
  { id: "support",    label: "Support" },
];

// Voice command routing table
export const VOICE_COMMANDS = [
  { keyword: "wheelchair",    dept: "Cleaning",    deptColor: "#9b9b9b", icon: "♿", action: "Wheelchair dispatched",                taskDesc: "Wheelchair requested" },
  { keyword: "crash cart",    dept: "Emergency",   deptColor: "#e53e3e", icon: "🚨", action: "Crash cart alerted",                   taskDesc: "CRASH CART — URGENT" },
  { keyword: "discharge",     dept: "Admin",       deptColor: "#d97706", icon: "🚪", action: "Discharge workflow initiated",           taskDesc: "Discharge process started" },
  { keyword: "iv fluid",      dept: "Pharmacy",    deptColor: "#7c3aed", icon: "💉", action: "IV fluid request sent to Pharmacy",     taskDesc: "IV fluid restock needed" },
  { keyword: "medication",    dept: "Pharmacy",    deptColor: "#7c3aed", icon: "💊", action: "Medication request queued",             taskDesc: "Medication request" },
  { keyword: "clean",         dept: "Cleaning",    deptColor: "#9b9b9b", icon: "🧹", action: "Cleaning task dispatched",             taskDesc: "Room cleaning requested" },
  { keyword: "oxygen",        dept: "Respiratory", deptColor: "#2bc6d4", icon: "🫁", action: "Oxygen support team notified",          taskDesc: "Oxygen support needed" },
  { keyword: "blood pressure", dept: "Nurse",     deptColor: "#2f92d0", icon: "🩺", action: "BP monitoring task created",            taskDesc: "Blood pressure check" },
  { keyword: "ecg",           dept: "Cardiology",  deptColor: "#e11d48", icon: "❤️", action: "ECG request sent to Cardiology",       taskDesc: "ECG monitoring needed" },
  { keyword: "lab",           dept: "Laboratory",  deptColor: "#0891b2", icon: "🧪", action: "Lab sample collection requested",      taskDesc: "Lab work order" },
  { keyword: "doctor",        dept: "Medical",     deptColor: "#2f92d0", icon: "👨‍⚕️", action: "Doctor paged",                        taskDesc: "Doctor consultation needed" },
  { keyword: "pain",          dept: "Nurse",       deptColor: "#2f92d0", icon: "😣", action: "Pain assessment task created",         taskDesc: "Pain management review" },
  { keyword: "fall",          dept: "Nurse",       deptColor: "#e53e3e", icon: "⚠️", action: "Fall protocol initiated",              taskDesc: "Fall prevention protocol" },
  { keyword: "code blue",     dept: "Emergency",   deptColor: "#e53e3e", icon: "🔵", action: "CODE BLUE announced",                  taskDesc: "CODE BLUE — ALL TEAMS" },
];

export const DEMO_TRANSCRIPTS = [
  "I need a wheelchair for bed 2",
  "crash cart to room 14",
  "discharge Mr. Gupta room 22A",
  "IV fluid needed for bed 7",
  "medication review for Mr. Chen",
  "clean room 18C after discharge",
  "oxygen support for bed 3",
  "code blue room 5",
  "lab work for Mrs. Sharma",
  "doctor consult needed room 18C",
];

// Initial patients (fallback)
export const INITIAL_PATIENTS = [
  {
    id: "P001", name: "Mrs. Sharma", age: 78, room: "4A", bed: "4A-1",
    risk: 92, riskLevel: "HIGH", riskColor: "#e53e3e", riskBg: "#fff5f5",
    diagnosis: "Post-Hip Replacement", bp: "142/88", spo2: 96, temp: 98.9, hr: 88,
    weight: 62, rr: 18, glucose: 112,
    factors: ["Age >70", "Diuretic use", "Gait instability", "Orthostatic hypotension"],
    meds: [
      { name: "Furosemide 40mg",   due: "08:00 AM", done: false, route: "Oral" },
      { name: "Atorvastatin 20mg", due: "09:00 PM", done: false, route: "Oral" },
    ],
    lastVitals: "14 min ago", admitDate: "Aug 14", status: "Critical", dischargeText: "5 days",
    allergies: ["Penicillin"],
    shapValues: [
      { factor: "Age >70", score: 0.38 }, { factor: "Diuretic use", score: 0.26 },
      { factor: "Gait instability", score: 0.19 }, { factor: "Orthostatic hypotension", score: 0.09 },
    ],
    vitalHistory: [
      { time: "06:00", hr: 84, spo2: 97, bp: "138/84", temp: 98.6 },
      { time: "08:00", hr: 86, spo2: 96, bp: "140/86", temp: 98.8 },
      { time: "10:00", hr: 88, spo2: 96, bp: "142/88", temp: 98.9 },
    ],
  },
  {
    id: "P002", name: "Ms. Jordan", age: 62, room: "18C", bed: "18C-2",
    risk: 47, riskLevel: "MEDIUM", riskColor: "#d97706", riskBg: "#fffbeb",
    diagnosis: "Appendectomy Recovery", bp: "118/72", spo2: 98, temp: 99.1, hr: 74,
    weight: 70, rr: 16, glucose: 95,
    factors: ["Post-Op Recovery", "Hypotension", "Analgesic use"],
    meds: [
      { name: "Paracetamol 500mg", due: "10:00 AM", done: true,  route: "Oral" },
      { name: "Tramadol 50mg",     due: "02:00 PM", done: false, route: "IV" },
    ],
    lastVitals: "31 min ago", admitDate: "Aug 16", status: "Stable", dischargeText: "2 days",
    allergies: [],
    shapValues: [
      { factor: "Post-Op Recovery", score: 0.22 }, { factor: "Hypotension", score: 0.15 },
      { factor: "Analgesic use", score: 0.10 },
    ],
    vitalHistory: [
      { time: "06:00", hr: 72, spo2: 99, bp: "114/70", temp: 98.8 },
      { time: "08:00", hr: 73, spo2: 98, bp: "116/71", temp: 98.9 },
      { time: "10:00", hr: 74, spo2: 98, bp: "118/72", temp: 99.1 },
    ],
  },
  {
    id: "P003", name: "Mr. Gupta", age: 45, room: "22A", bed: "22A-3",
    risk: 18, riskLevel: "LOW", riskColor: "#16a34a", riskBg: "#f0fdf4",
    diagnosis: "Pneumonia (Resolving)", bp: "126/80", spo2: 99, temp: 98.4, hr: 68,
    weight: 75, rr: 14, glucose: 88,
    factors: ["None Detected"],
    meds: [
      { name: "Azithromycin 500mg", due: "08:00 AM", done: true, route: "Oral" },
    ],
    lastVitals: "8 min ago", admitDate: "Aug 15", status: "Improving", dischargeText: "1 day",
    allergies: ["Sulfa drugs"],
    shapValues: [
      { factor: "Age", score: 0.05 }, { factor: "Illness duration", score: 0.03 },
    ],
    vitalHistory: [
      { time: "06:00", hr: 66, spo2: 99, bp: "122/78", temp: 98.2 },
      { time: "08:00", hr: 67, spo2: 99, bp: "124/79", temp: 98.3 },
      { time: "10:00", hr: 68, spo2: 99, bp: "126/80", temp: 98.4 },
    ],
  },
  {
    id: "P004", name: "Mr. Chen", age: 55, room: "12B", bed: "12B-1",
    risk: 61, riskLevel: "MEDIUM", riskColor: "#d97706", riskBg: "#fffbeb",
    diagnosis: "Type 2 Diabetes — Hyperglycemia", bp: "138/86", spo2: 97, temp: 98.6, hr: 82,
    weight: 85, rr: 17, glucose: 248,
    factors: ["Insulin-dependent", "Neuropathy", "Poor vision"],
    meds: [
      { name: "Insulin Glargine 20U", due: "08:00 AM", done: false, route: "SC" },
      { name: "Metformin 500mg",      due: "01:00 PM", done: false, route: "Oral" },
    ],
    lastVitals: "22 min ago", admitDate: "Aug 17", status: "Monitoring", dischargeText: "3 days",
    allergies: [],
    shapValues: [
      { factor: "Insulin-dependent", score: 0.28 }, { factor: "Neuropathy", score: 0.20 },
      { factor: "Poor vision", score: 0.13 },
    ],
    vitalHistory: [
      { time: "06:00", hr: 80, spo2: 97, bp: "134/84", temp: 98.4 },
      { time: "08:00", hr: 81, spo2: 97, bp: "136/85", temp: 98.5 },
      { time: "10:00", hr: 82, spo2: 97, bp: "138/86", temp: 98.6 },
    ],
  },
  {
    id: "P005", name: "Mrs. Patel", age: 68, room: "9C", bed: "9C-1",
    risk: 84, riskLevel: "HIGH", riskColor: "#e53e3e", riskBg: "#fff5f5",
    diagnosis: "COPD Exacerbation", bp: "145/92", spo2: 91, temp: 100.2, hr: 104,
    weight: 55, rr: 24, glucose: 130,
    factors: ["COPD", "SpO₂ < 95%", "Tachycardia", "Fever"],
    meds: [
      { name: "Salbutamol Nebulizer", due: "STAT",     done: false, route: "Nebulizer" },
      { name: "Prednisolone 40mg",    due: "08:00 AM", done: false, route: "Oral" },
      { name: "Amoxicillin 500mg",    due: "08:00 AM", done: false, route: "IV" },
    ],
    lastVitals: "5 min ago", admitDate: "Aug 19", status: "Critical", dischargeText: "7 days",
    allergies: ["NSAIDs"],
    shapValues: [
      { factor: "SpO₂ < 95%", score: 0.42 }, { factor: "COPD history", score: 0.28 },
      { factor: "Fever", score: 0.14 },
    ],
    vitalHistory: [
      { time: "06:00", hr: 98,  spo2: 93, bp: "140/88", temp: 99.8 },
      { time: "08:00", hr: 101, spo2: 92, bp: "143/90", temp: 100.0 },
      { time: "10:00", hr: 104, spo2: 91, bp: "145/92", temp: 100.2 },
    ],
  },
];

// Initial tasks
export const INITIAL_TASKS = [
  { id: 1, patient: "Mrs. Sharma", room: "4A",  desc: "Fall risk assessment due",           priority: "High",   priorityColor: "#e53e3e", done: false, source: "AI",     time: "NOW",      category: "Assessment" },
  { id: 2, patient: "Mr. Chen",    room: "12B", desc: "Insulin administration (20U SC)",    priority: "High",   priorityColor: "#e53e3e", done: false, source: "EMR",    time: "08:00 AM", category: "Medication" },
  { id: 3, patient: "Ms. Jordan",  room: "18C", desc: "Post-op wound dressing change",      priority: "Medium", priorityColor: "#d97706", done: false, source: "Doctor", time: "10:00 AM", category: "Wound Care" },
  { id: 4, patient: "Bed 7",       room: "07A", desc: "Replace IV fluid bag",               priority: "Low",    priorityColor: "#2f92d0", done: false, source: "Auto",   time: "11:30 AM", category: "IV Care" },
  { id: 5, patient: "Mr. Gupta",   room: "22A", desc: "Discharge prep — vitals final check",priority: "Medium", priorityColor: "#d97706", done: false, source: "Doctor", time: "12:00 PM", category: "Discharge" },
  { id: 6, patient: "Mrs. Patel",  room: "9C",  desc: "Nebulizer treatment — STAT",         priority: "High",   priorityColor: "#e53e3e", done: false, source: "AI",     time: "NOW",      category: "Respiratory" },
];

// Initial critical alerts
export const INITIAL_ALERTS = [
  {
    id: 1, time: "10:45 AM", type: "vitals",   severity: "critical",
    patient: "Mrs. Patel", room: "9C",
    message: "SpO₂ critically low at 91% — Oxygen support required immediately",
    acknowledged: false, color: "#e53e3e",
  },
  {
    id: 2, time: "10:32 AM", type: "fall",     severity: "high",
    patient: "Mrs. Sharma", room: "4A",
    message: "Fall risk score elevated to 92% — Hourly rounds required",
    acknowledged: false, color: "#d97706",
  },
  {
    id: 3, time: "10:15 AM", type: "medication", severity: "high",
    patient: "Mr. Chen", room: "12B",
    message: "Insulin Glargine 20U overdue by 45 minutes",
    acknowledged: true, color: "#d97706",
  },
  {
    id: 4, time: "09:55 AM", type: "vitals",   severity: "medium",
    patient: "Mrs. Patel", room: "9C",
    message: "Heart rate 104 bpm — Monitor for tachycardia progression",
    acknowledged: true, color: "#2f92d0",
  },
];

// Schedule data
export const INITIAL_SCHEDULE = [
  { id: 1, time: "07:00", task: "Morning handover & patient assessment",      nurse: "Nurse Priya",  room: "All",  type: "routine",  done: true  },
  { id: 2, time: "08:00", task: "Medication round — insulin & morning meds",  nurse: "Nurse Priya",  room: "12B",  type: "med",      done: true  },
  { id: 3, time: "08:30", task: "Vital signs check — all high-risk patients", nurse: "Nurse Ankit",  room: "4A,9C",type: "vitals",   done: true  },
  { id: 4, time: "09:00", task: "Wound dressing change — post-op care",       nurse: "Nurse Ankit",  room: "18C",  type: "wound",    done: false },
  { id: 5, time: "10:00", task: "Nebulizer treatment — COPD patient",         nurse: "Nurse Priya",  room: "9C",   type: "resp",     done: false },
  { id: 6, time: "10:30", task: "Fall risk reassessment — Mrs. Sharma",       nurse: "Nurse Ankit",  room: "4A",   type: "assess",   done: false },
  { id: 7, time: "11:00", task: "IV fluid replacement — Bed 7",               nurse: "Nurse Priya",  room: "07A",  type: "iv",       done: false },
  { id: 8, time: "12:00", task: "Discharge preparation — Mr. Gupta",          nurse: "Nurse Ankit",  room: "22A",  type: "discharge",done: false },
  { id: 9, time: "13:00", task: "Afternoon medication round",                  nurse: "Nurse Priya",  room: "All",  type: "med",      done: false },
  { id: 10,time: "14:00", task: "Physician-nurse liaison meeting",             nurse: "Both",         room: "Conf", type: "meeting",  done: false },
  { id: 11,time: "15:00", task: "Patient education — diabetes management",     nurse: "Nurse Priya",  room: "12B",  type: "education",done: false },
  { id: 12,time: "16:00", task: "Evening vitals — all patients",               nurse: "Nurse Ankit",  room: "All",  type: "vitals",   done: false },
];

// Bed/ward map
export const WARD_BEDS = [
  { id: "4A-1",  room: "4A",  status: "occupied",  patient: "Mrs. Sharma", risk: "HIGH"   },
  { id: "4A-2",  room: "4A",  status: "empty",     patient: null,          risk: null      },
  { id: "7A-1",  room: "07A", status: "occupied",  patient: "Bed 7",       risk: "LOW"    },
  { id: "7A-2",  room: "07A", status: "cleaning",  patient: null,          risk: null      },
  { id: "9C-1",  room: "9C",  status: "occupied",  patient: "Mrs. Patel",  risk: "HIGH"   },
  { id: "9C-2",  room: "9C",  status: "reserved",  patient: null,          risk: null      },
  { id: "12B-1", room: "12B", status: "occupied",  patient: "Mr. Chen",    risk: "MEDIUM" },
  { id: "12B-2", room: "12B", status: "empty",     patient: null,          risk: null      },
  { id: "18C-1", room: "18C", status: "empty",     patient: null,          risk: null      },
  { id: "18C-2", room: "18C", status: "occupied",  patient: "Ms. Jordan",  risk: "MEDIUM" },
  { id: "22A-1", room: "22A", status: "empty",     patient: null,          risk: null      },
  { id: "22A-3", room: "22A", status: "occupied",  patient: "Mr. Gupta",   risk: "LOW"    },
];

// Activity log seed
export const ACTIVITY_LOG_INIT = [
  { id: 1, time: "10:45 AM", agent: "Vitals Monitor",    action: "Mrs. Patel SpO₂ dropped to 91% — Critical alert raised.", type: "vitals", hash: "0x7a2b...f91" },
  { id: 2, time: "10:32 AM", agent: "Nurse Assistant AI", action: "Voice command processed: 'wheelchair for bed 2' → Dispatched to Cleaning.", type: "voice", hash: "0x3c9d...a12" },
  { id: 3, time: "10:28 AM", agent: "Fall Risk Model",    action: "Mrs. Sharma risk score updated: 85% → 92%. High-priority task created.", type: "ai", hash: "0x1f2a...b44" },
  { id: 4, time: "10:15 AM", agent: "Medication Reminder",action: "Alert: Mr. Chen — Insulin Glargine 20U due at 08:00 AM. Nurse notified.", type: "med", hash: "0x9e4c...f02" },
];
