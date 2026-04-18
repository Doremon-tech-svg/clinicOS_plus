import { useState, useRef, useEffect, useCallback } from "react";
import {
  Activity, AlertTriangle, Bell, BarChart3, FileText, HeartPulse,
  HelpCircle, History, Keyboard, Mic, MapPin, Navigation, Settings,
  Shield, Stethoscope, Wifi, Loader2, CheckCircle2, XCircle,
  ClipboardList, Zap,
} from "lucide-react";

const HOSPITAL = { lat: 28.5672, lng: 77.2100, name: "AIIMS Delhi" };
const API      = "http://localhost:8000";

const sideLinks = [
  { label: "Command Center", icon: Activity, active: true },
  { label: "Patient Queue",  icon: AlertTriangle },
  { label: "Routing AI",     icon: MapPin },
  { label: "Resource Logs",  icon: FileText },
  { label: "Analytics",      icon: BarChart3 },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
             * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SEV_DOT  = { Critical: "bg-red-500", Moderate: "bg-amber-400", Stable: "bg-green-500" };
const SEV_TEXT = { Critical: "text-red-700", Moderate: "text-amber-700", Stable: "text-green-700" };
const SEV_BG   = { Critical: "bg-red-50 border-red-200", Moderate: "bg-amber-50 border-amber-200", Stable: "bg-green-50 border-green-200" };

export default function Emergency() {
  const [isPanelOpen,      setIsPanelOpen]      = useState(false);
  const [conditionInput,   setConditionInput]   = useState("");
  const [etaInput,         setEtaInput]         = useState("");
  const [severity,         setSeverity]         = useState("Critical");
  const [additionalNotes,  setAdditionalNotes]  = useState("");
  const [isListening,  setIsListening]  = useState(false);
  const [transcript,   setTranscript]   = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiConfidence,    setAiConfidence]    = useState(94);
  const [recommendedDepts, setRecommendedDepts] = useState([]);
  const [aiPrep,          setAiPrep]          = useState([]);
  const [clinicalNote,    setClinicalNote]    = useState("");
  const [alertStatus,  setAlertStatus]  = useState(null);
  const [blockchainTx, setBlockchainTx] = useState("");
  const [isSending,    setIsSending]    = useState(false);
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [gpsETA,       setGpsETA]       = useState(null);
  const [gpsStatus,    setGpsStatus]    = useState("Requesting GPS\u2026");
  const [liveAlerts,     setLiveAlerts]     = useState([]);
  const [alertsLoading,  setAlertsLoading]  = useState(true);

  const recognitionRef  = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const ambMarkerRef    = useRef(null);
  const routeLineRef    = useRef(null);
  const lastAiDataRef   = useRef(null);

  const initMap = useCallback(() => {
    if (mapRef.current || !mapContainerRef.current || !window.L) return;
    const L   = window.L;
    const map = L.map(mapContainerRef.current, {
      zoomControl: true, scrollWheelZoom: false, attributionControl: false,
    }).setView([HOSPITAL.lat, HOSPITAL.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
    const hospitalIcon = L.divIcon({
      className: "",
      html: `<div style="background:#bc000c;color:#fff;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.35)">\uD83C\uDFE5 AIIMS Delhi</div>`,
      iconAnchor: [55, 10],
    });
    L.marker([HOSPITAL.lat, HOSPITAL.lng], { icon: hospitalIcon }).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (window.L) { initMap(); }
    else if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js"; script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap; document.head.appendChild(script);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; ambMarkerRef.current = null; routeLineRef.current = null;
      }
    };
  }, [initMap]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !ambulancePos) return;
    const ambIcon = L.divIcon({
      className: "",
      html: `<div style="background:#1a73e8;color:#fff;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.35)">\uD83D\uDE91 Ambulance</div>`,
      iconAnchor: [45, 10],
    });
    if (ambMarkerRef.current) { ambMarkerRef.current.setLatLng([ambulancePos.lat, ambulancePos.lng]); }
    else { ambMarkerRef.current = L.marker([ambulancePos.lat, ambulancePos.lng], { icon: ambIcon }).addTo(mapRef.current); }
    const latlngs = [[ambulancePos.lat, ambulancePos.lng], [HOSPITAL.lat, HOSPITAL.lng]];
    if (routeLineRef.current) { routeLineRef.current.setLatLngs(latlngs); }
    else { routeLineRef.current = L.polyline(latlngs, { color: "#bc000c", weight: 3, opacity: 0.75, dashArray: "8 6" }).addTo(mapRef.current); }
    mapRef.current.fitBounds(latlngs, { padding: [40, 40] });
  }, [ambulancePos]);

  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus("GPS unavailable"); return; }
    setGpsStatus("Acquiring GPS\u2026");
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setAmbulancePos({ lat, lng });
        const distKm  = haversine(lat, lng, HOSPITAL.lat, HOSPITAL.lng);
        const etaMins = (distKm / 40) * 60;
        setGpsETA(etaMins);
        setEtaInput(Math.ceil(etaMins).toString());
        setGpsStatus(`GPS active \u00b7 ${distKm.toFixed(1)} km to ${HOSPITAL.name}`);
      },
      (err) => setGpsStatus(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      setAlertsLoading(true);
      try {
        const res = await fetch(`${API}/api/live-alerts`);
        if (res.ok) { const data = await res.json(); setLiveAlerts(data.alerts || []); }
      } catch (e) { console.error("Live alerts fetch failed:", e); }
      finally { setAlertsLoading(false); }
    };
    fetchAlerts();
    const id = setInterval(fetchAlerts, 20000);
    return () => clearInterval(id);
  }, []);

  const sendEmergencyAlert = useCallback(async (aiData = null) => {
    const condition = aiData?.condition_summary || conditionInput;
    const eta       = etaInput;
    const sev       = aiData?.severity || severity;
    if (!condition || !eta) { if (!aiData) alert("Please fill Patient Condition and ETA."); return; }
    setIsSending(true); setAlertStatus(null);
    const payload = {
      condition, eta, severity: sev,
      preparation:   aiData?.preparation   || [],
      clinical_note: aiData?.clinical_note || "",
      departments:   aiData?.departments   || [],
    };
    try {
      const res = await fetch(`${API}/api/ambulance/alert`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setAlertStatus("success"); setBlockchainTx(data.blockchain_tx || "");
        if (data.departments) setRecommendedDepts(data.departments);
      } else { setAlertStatus("error"); }
    } catch { setAlertStatus("error"); }
    finally { setIsSending(false); }
  }, [conditionInput, etaInput, severity]);

  const autoFillWithAI = useCallback(async (inputText) => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/api/parse-condition`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: inputText }),
      });
      if (res.ok) {
        const data = await res.json();
        setConditionInput(data.condition_summary);
        setSeverity(data.severity);
        if (!gpsETA) setEtaInput(data.suggested_eta.toString());
        setRecommendedDepts(data.departments || []);
        setAiPrep(data.preparation || []);
        setClinicalNote(data.clinical_note || "");
        setAiConfidence(data.confidence || 90);
        lastAiDataRef.current = data;
        await sendEmergencyAlert(data);
      }
    } catch (e) { console.error("AI parse failed:", e); }
    finally { setIsProcessing(false); }
  }, [gpsETA, sendEmergencyAlert]);

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = false; rec.lang = "en-IN";
    rec.onstart  = () => setIsListening(true);
    rec.onresult = (e) => { const text = e.results[0][0].transcript; setTranscript(text); autoFillWithAI(text); };
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => setIsListening(false);
    recognitionRef.current = rec; rec.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const routeOptions = recommendedDepts.length > 0
    ? recommendedDepts.map((dept, i) => ({
        name: dept, status: i === 0 ? "Primary" : "Standby",
        dot: i === 0 ? "bg-red-500" : "bg-slate-400", text: i === 0 ? "text-red-600" : "text-slate-600",
      }))
    : [
        { name: "OT Silver Cardiology", status: "Primary",     dot: "bg-red-500",    text: "text-red-600" },
        { name: "Lab Violet",           status: "Standby",     dot: "bg-violet-400", text: "text-violet-600" },
        { name: "Nursing Blue",         status: "Prep",        dot: "bg-blue-400",   text: "text-blue-600" },
        { name: "OPD Green",            status: "NOT Alerted", dot: "bg-green-300",  text: "text-slate-300", muted: true },
      ];

  const displayETA = gpsETA !== null ? gpsETA.toFixed(1).replace(".", ":") : (etaInput ? `${etaInput}:00` : "\u2014:\u2014");

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-['Manrope'] text-[#1a1c1c] antialiased">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-[#f9f9f9]/80 px-8 shadow-[0_8px_32px_rgba(26,28,28,0.06)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsPanelOpen(p => !p)} className="text-xl font-extrabold tracking-tighter text-red-600 uppercase">Clinical Pulse</button>
          <div className="h-4 w-px bg-[#e2e2e2]" />
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-green-700">Connected</span>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1 md:flex">
            <Navigation className="h-3 w-3 text-blue-600" />
            <span className="text-[10px] font-bold tracking-wider text-blue-700">{gpsStatus}</span>
          </div>
        </div>
        <nav className="hidden gap-8 md:flex">
          <a href="#" className="border-b-2 border-red-600 pb-1 font-semibold tracking-tight text-red-600">Dashboard</a>
          <a href="#" className="font-medium tracking-tight text-slate-500 hover:text-red-500">Active Runs</a>
          <a href="#" className="font-medium tracking-tight text-slate-500 hover:text-red-500">Fleet</a>
          <a href="#" className="font-medium tracking-tight text-slate-500 hover:text-red-500">Dispatch</a>
        </nav>
        <div className="flex items-center gap-6">
          <Wifi className="h-5 w-5 cursor-pointer text-[#603e3a] hover:text-[#bc000c]" />
          <Bell className="h-5 w-5 cursor-pointer text-[#603e3a] hover:text-[#bc000c]" />
          <Settings className="h-5 w-5 cursor-pointer text-[#603e3a] hover:text-[#bc000c]" />
          <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-[#ffdad5] bg-[#e8e8e8]">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMDCjuECAEGKKuOergPjbjgpqU97lRjgy_djnKA6yJBgyEqTw4Ie9z0l3wcCaZ92Pzig4iaJ6hVcUME9FOcSAUPn4qtC9a_hX3ptSClaNwZqAydirZKPTNuqZ7BMYYkAqbwApB1TMLTbcb5Cg7hn_UFOmRUCD7tlJ8uupK02L8JrasWTf7r8zz_eI3hCmvTspjEk_FBi-O-EdUNkhE1yz6WPmYbd0044ubVQmI194nSK2J6vpwcDBvDVoNPeBvP2cDGn-loZghzwo" alt="CMO" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      {isPanelOpen && <button aria-label="Close panel" onClick={() => setIsPanelOpen(false)} className="fixed inset-0 top-16 z-30 bg-black/15" />}

      <aside className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-64px)] w-64 flex-col bg-[#f3f3f3] p-4 transition-transform duration-300 md:flex ${isPanelOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 rounded-xl border border-[#ebbbb5]/20 bg-white/80 px-4 py-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad5]">
              <Stethoscope className="h-5 w-5 text-[#bc000c]" />
            </div>
            <div>
              <h4 className="text-xs font-black tracking-widest uppercase">Unit 7-Alpha</h4>
              <p className="text-[10px] font-bold tracking-wide text-[#bc000c] uppercase">High Priority Station</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {sideLinks.map(item => (
            <a key={item.label} href="#" className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all ${item.active ? "bg-white/80 text-red-600 shadow-sm" : "text-slate-600 hover:bg-red-50"}`}>
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-widest uppercase">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <a href="#" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-red-50"><HeartPulse className="h-4 w-4" /><span className="text-[10px] font-black tracking-widest uppercase">System Health</span></a>
          <a href="#" className="flex items-center gap-4 px-4 py-3 text-slate-600 hover:bg-red-50"><HelpCircle className="h-4 w-4" /><span className="text-[10px] font-black tracking-widest uppercase">Help</span></a>
          <button className="mt-4 w-full rounded-lg bg-[#bc000c] py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg hover:bg-[#ea0012]">Initiate Emergency</button>
        </div>
      </aside>

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-12">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Ambulance Command Portal</h1>
          <p className="mt-2 text-lg font-medium text-[#603e3a] opacity-80">Voice Dispatch &middot; Live GPS Tracking &middot; Auto Alerts</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

          {/* Voice input */}
          <section className="glass-panel ghost-border relative overflow-hidden rounded-xl p-8 lg:col-span-12">
            <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
              <span className="rounded-full bg-[#ffdad5] px-3 py-1 text-xs font-black tracking-widest text-[#930007] uppercase">AI Confidence: {aiConfidence}%</span>
            </div>
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <div className="flex flex-col items-center">
                <button onClick={isListening ? stopVoice : startVoice}
                  className={`flex h-24 w-24 items-center justify-center rounded-full text-white active:scale-95 transition-all ${isListening ? "bg-red-700 animate-pulse" : "bg-[#ea0012] pulsing-red"}`}>
                  {isProcessing ? <Loader2 className="h-10 w-10 animate-spin" /> : <Mic className="h-10 w-10" />}
                </button>
                <span className="mt-4 text-sm font-bold tracking-widest text-[#bc000c] uppercase">
                  {isListening ? "Listening\u2026" : isProcessing ? "Processing\u2026" : "Click to Speak"}
                </span>
                {isProcessing && <span className="mt-1 text-[10px] text-slate-400 font-medium">auto-sending alert&hellip;</span>}
              </div>
              <div className="w-full flex-1">
                <div className="min-h-[80px] rounded-lg border-l-4 border-[#bc000c] bg-[#f3f3f3] p-6">
                  {transcript ? (
                    <>
                      <p className="text-xl font-medium leading-relaxed">"{transcript}"</p>
                      <div className="mt-3 flex gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#bc000c]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#bc000c] [animation-delay:150ms]" />
                      </div>
                    </>
                  ) : (
                    <p className="text-xl font-medium leading-relaxed text-gray-400">Click the mic and describe the patient's condition. Auto-fill and dispatch immediately.</p>
                  )}
                </div>
                {aiPrep.length > 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-700" />
                      <span className="text-xs font-black tracking-widest text-amber-800 uppercase">Hospital Preparation Checklist</span>
                    </div>
                    <ul className="space-y-1">
                      {aiPrep.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{item}
                        </li>
                      ))}
                    </ul>
                    {clinicalNote && (
                      <div className="mt-3 rounded border border-amber-200 bg-white/60 p-3 text-sm italic text-amber-900">
                        <span className="font-bold not-italic">Nurse note: </span>{clinicalNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Left column */}
          <div className="space-y-8 lg:col-span-8">
            <section className="glass-panel ghost-border rounded-xl p-8">
              <div className="mb-6 flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-[#603e3a]" />
                <h2 className="text-xl font-bold tracking-tight uppercase">Manual Entry</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest text-[#603e3a] uppercase">Patient Condition</label>
                  <input value={conditionInput} onChange={e => setConditionInput(e.target.value)}
                    onBlur={e => e.target.value && !transcript && autoFillWithAI(e.target.value)}
                    className="h-12 w-full rounded-lg border-none bg-[#e2e2e2] px-3 placeholder:text-[#956d68] focus:ring-2 focus:ring-[#bc000c]/20"
                    placeholder="e.g. Chest Pain, Respiratory Distress" />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest text-[#603e3a] uppercase">
                    ETA (minutes){ambulancePos && <span className="ml-1 normal-case text-blue-600">&middot; GPS live</span>}
                  </label>
                  <input type="number" value={etaInput} onChange={e => setEtaInput(e.target.value)}
                    className="h-12 w-full rounded-lg border-none bg-[#e2e2e2] px-3 focus:ring-2 focus:ring-[#bc000c]/20" placeholder="8" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold tracking-widest text-[#603e3a] uppercase">Severity Level</label>
                  <div className="flex gap-1 rounded-lg bg-[#e2e2e2] p-1">
                    {["Critical", "Moderate", "Stable"].map(opt => (
                      <button key={opt} type="button" onClick={() => setSeverity(opt)}
                        className={`flex-1 rounded-md py-3 text-sm font-bold tracking-wider uppercase ${severity === opt ? "bg-[#bc000c] text-white" : "text-[#603e3a] hover:bg-[#dadada]"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-bold tracking-widest text-[#603e3a] uppercase">Additional Dispatch Notes</label>
                  <textarea rows={3} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
                    className="w-full rounded-lg border-none bg-[#e2e2e2] p-3 placeholder:text-[#956d68] focus:ring-2 focus:ring-[#bc000c]/20"
                    placeholder="Previous cardiac history, allergies, medications\u2026" />
                </div>
              </div>
            </section>

            {/* Live alert feed */}
            <section className="glass-panel ghost-border overflow-hidden rounded-xl">
              <div className="flex items-center justify-between border-b border-[#ebbbb5]/20 bg-[#f3f3f3] p-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black tracking-widest text-[#603e3a] uppercase">Live Alert Feed</h2>
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 uppercase">auto-refresh 20s</span>
                </div>
                <div className="flex items-center gap-2">
                  {alertsLoading && <Loader2 className="h-4 w-4 animate-spin text-[#bc000c]" />}
                  <History className="h-5 w-5 text-[#bc000c]" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black tracking-tight text-[#956d68] uppercase">
                      <th className="px-6 py-4">Incident</th><th className="px-6 py-4">Unit</th>
                      <th className="px-6 py-4">Dept</th><th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">ETA</th><th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8]">
                    {liveAlerts.length === 0 && !alertsLoading && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No active alerts</td></tr>
                    )}
                    {liveAlerts.map((alert, i) => (
                      <tr key={i} className="transition-colors hover:bg-[#ffdad5]/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 shrink-0 rounded-full ${SEV_DOT[alert.severity] || "bg-slate-400"}`} />
                            <span className="font-bold text-sm">{alert.incident}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{alert.unit}</td>
                        <td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">{alert.department}</span></td>
                        <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold border ${SEV_BG[alert.severity] || "bg-slate-50 border-slate-200"} ${SEV_TEXT[alert.severity] || "text-slate-700"}`}>{alert.status}</span></td>
                        <td className="px-6 py-4 text-sm font-bold text-[#bc000c]">{alert.eta}</td>
                        <td className="px-6 py-4 text-xs font-medium text-[#603e3a]">{alert.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="glass-panel ghost-border rounded-xl border-l-8 border-[#bc000c] p-6">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-xs font-black tracking-widest text-[#bc000c] uppercase">Diagnosis Preview</h3>
                  <h2 className="text-xl font-extrabold tracking-tight leading-tight truncate">{conditionInput || "Awaiting input\u2026"}</h2>
                  {severity && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${SEV_BG[severity]} ${SEV_TEXT[severity]}`}>{severity}</span>}
                </div>
                <div className="ml-4 text-right shrink-0">
                  <span className="text-3xl font-black tracking-tighter text-[#bc000c]">{displayETA}</span>
                  <p className="text-[10px] font-black tracking-widest text-[#603e3a] uppercase">{ambulancePos ? "GPS ETA" : "ETA"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-[#603e3a] uppercase">Recommended Routing</h4>
                <div className="space-y-3">
                  {routeOptions.map((route, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-lg bg-white p-3 ${route.muted ? "opacity-40" : ""}`}>
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${route.dot}`} />
                        <span className="text-sm font-bold">{route.name}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase ${route.text}`}>{route.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={() => sendEmergencyAlert()} disabled={isSending}
                className="flex h-20 w-full items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-[#ea0012] to-[#bc000c] text-white shadow-[0_12px_40px_-12px_rgba(188,0,12,0.5)] transition-all hover:shadow-[0_16px_48px_-10px_rgba(188,0,12,0.6)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {isSending
                  ? <><Loader2 className="h-8 w-8 animate-spin" /><span className="text-xl font-black tracking-widest uppercase">Sending\u2026</span></>
                  : <><AlertTriangle className="h-8 w-8" /><span className="text-xl font-black tracking-widest uppercase">Send Emergency Alert</span></>}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-medium">Voice auto-sends &middot; this button is for manual dispatch</p>
              {alertStatus === "success" && (
                <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-green-700 border border-green-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Alert Dispatched!</p>
                    <p className="text-xs">Departments notified. Blockchain logged.</p>
                    {aiPrep.length > 0 && <p className="text-xs mt-1">Prep checklist included in message.</p>}
                  </div>
                </div>
              )}
              {alertStatus === "error" && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-700 border border-red-200">
                  <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div><p className="text-sm font-bold">Send Failed</p><p className="text-xs">Check backend connection and try again.</p></div>
                </div>
              )}
            </div>

            {blockchainTx && (
              <div className="px-1">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-tight text-[#603e3a]/70 uppercase">
                  <Shield className="h-3 w-3" />
                  <span>Tx: {blockchainTx.slice(0, 10)}&hellip;{blockchainTx.slice(-6)} &mdash; Hospital Brain Ledger</span>
                </div>
              </div>
            )}

            <div className="glass-panel ghost-border group relative overflow-hidden rounded-xl" style={{ height: "280px" }}>
              <div ref={mapContainerRef} className="h-full w-full" />
              <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/80 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">Live View &middot; {HOSPITAL.name}</div>
              {gpsETA !== null && <div className="pointer-events-none absolute right-3 bottom-3 rounded-lg bg-[#bc000c] px-4 py-2 font-black tracking-tight text-white text-sm">ETA {gpsETA.toFixed(1)} min</div>}
              {ambulancePos && (
                <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-700">
                  <Navigation className="mr-1 inline h-3 w-3 text-blue-600" />
                  {ambulancePos.lat.toFixed(4)}, {ambulancePos.lng.toFixed(4)}
                </div>
              )}
              {!ambulancePos && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40">
                  <div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#bc000c]" /><p className="mt-1 text-xs font-bold text-slate-500">Acquiring GPS\u2026</p></div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
        .glass-panel { background: rgba(255,255,255,0.8); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .ghost-border { border: 1px solid rgba(235,187,181,0.2); }
        .pulsing-red  { box-shadow: 0 0 0 0 rgba(234,0,18,0.4); animation: pulse 2s infinite; }
        @keyframes pulse {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,0,18,0.7); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 15px rgba(234,0,18,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,0,18,0); }
        }
        .leaflet-pane, .leaflet-control { z-index: 10 !important; }
        .leaflet-top, .leaflet-bottom   { z-index: 11 !important; }
      `}</style>
    </div>
  );
}