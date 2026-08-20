import { useState, useEffect, useRef, useCallback } from 'react';
import { HOSPITAL, API } from './constants';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function useEmergency() {
  // ── Input state ──
  const [conditionInput, setConditionInput] = useState('');
  const [etaInput, setEtaInput]             = useState('');
  const [severity, setSeverity]             = useState('Critical');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // ── Voice/AI state ──
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(94);
  const [aiPrep, setAiPrep]             = useState([]);
  const [clinicalNote, setClinicalNote] = useState('');
  const [recommendedDepts, setRecommendedDepts] = useState([]);

  // ── Alert state ──
  const [alertStatus, setAlertStatus]   = useState(null); // success | error
  const [blockchainTx, setBlockchainTx] = useState('');
  const [isSending, setIsSending]       = useState(false);

  // ── Live data ──
  const [liveAlerts, setLiveAlerts]     = useState([]);
  const [dbAlerts, setDbAlerts]         = useState([]);
  const [fleet, setFleet]               = useState([]);
  const [staff, setStaff]               = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // ── GPS state ──
  const [ambulancePos, setAmbulancePos] = useState(null);
  const [gpsETA, setGpsETA]             = useState(null);
  const [gpsStatus, setGpsStatus]       = useState('Requesting GPS…');

  const recognitionRef = useRef(null);
  const lastAiDataRef  = useRef(null);

  // ── Fetch live alerts (AI-generated feed) ──
  const fetchLiveAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch(`${API}/api/emergency/live-alerts`);
      if (res.ok) { const d = await res.json(); setLiveAlerts(d.alerts || []); }
    } catch {}
    finally { setAlertsLoading(false); }
  }, []);

  // ── Fetch real DB alerts ──
  const fetchDbAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ambulance/alerts`);
      if (res.ok) { const d = await res.json(); setDbAlerts(d.alerts || []); }
    } catch {}
  }, []);

  // ── Fetch fleet ──
  const fetchFleet = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/ambulance/fleet`);
      if (res.ok) { const d = await res.json(); setFleet(d.fleet || []); }
    } catch {}
  }, []);

  // ── Fetch staff (doctors + nurses) ──
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/staff`);
      if (res.ok) { const d = await res.json(); setStaff(d.staff || []); }
    } catch {}
  }, []);

  // ── Poll everything ──
  useEffect(() => {
    fetchLiveAlerts(); fetchDbAlerts(); fetchFleet(); fetchStaff();
    const id = setInterval(() => { fetchLiveAlerts(); fetchDbAlerts(); fetchFleet(); }, 20000);
    return () => clearInterval(id);
  }, [fetchLiveAlerts, fetchDbAlerts, fetchFleet, fetchStaff]);

  // ── GPS watch ──
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('GPS unavailable'); return; }
    setGpsStatus('Acquiring GPS…');
    const wid = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setAmbulancePos({ lat, lng });
        const dist = haversine(lat, lng, HOSPITAL.lat, HOSPITAL.lng);
        const eta  = (dist / 40) * 60;
        setGpsETA(eta);
        setEtaInput(Math.ceil(eta).toString());
        setGpsStatus(`GPS active · ${dist.toFixed(1)} km to ${HOSPITAL.name}`);
      },
      err => setGpsStatus(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(wid);
  }, []);

  // ── Send alert ──
  const sendEmergencyAlert = useCallback(async (aiData = null) => {
    const condition = aiData?.condition_summary || conditionInput;
    const eta       = etaInput;
    const sev       = aiData?.severity || severity;
    if (!condition || !eta) { if (!aiData) alert('Fill condition & ETA'); return; }
    setIsSending(true); setAlertStatus(null);
    try {
      const res = await fetch(`${API}/api/ambulance/alert`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition, eta, severity: sev,
          preparation: aiData?.preparation || [],
          clinical_note: aiData?.clinical_note || '',
          departments: aiData?.departments || [] }),
      });
      if (res.ok) {
        const d = await res.json();
        setAlertStatus('success'); setBlockchainTx(d.blockchain_tx || '');
        if (d.departments) setRecommendedDepts(d.departments);
        fetchDbAlerts();
      } else setAlertStatus('error');
    } catch { setAlertStatus('error'); }
    finally { setIsSending(false); }
  }, [conditionInput, etaInput, severity, fetchDbAlerts]);

  // ── AI parse ──
  const autoFillWithAI = useCallback(async (inputText) => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API}/api/emergency/parse-condition`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      if (res.ok) {
        const d = await res.json();
        setConditionInput(d.condition_summary);
        setSeverity(d.severity);
        if (!gpsETA) setEtaInput(d.suggested_eta.toString());
        setRecommendedDepts(d.departments || []);
        setAiPrep(d.preparation || []);
        setClinicalNote(d.clinical_note || '');
        setAiConfidence(d.confidence || 90);
        lastAiDataRef.current = d;
        await sendEmergencyAlert(d);
      }
    } catch (e) { console.error('AI parse failed:', e); }
    finally { setIsProcessing(false); }
  }, [gpsETA, sendEmergencyAlert]);

  // ── Voice ──
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech not supported'); return; }
    const rec = new SR();
    rec.lang = 'en-IN'; rec.interimResults = false;
    rec.onstart  = () => setIsListening(true);
    rec.onresult = e => { const t = e.results[0][0].transcript; setTranscript(t); autoFillWithAI(t); };
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => setIsListening(false);
    recognitionRef.current = rec; rec.start();
  };
  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  // ── Patch alert lifecycle ──
  const patchAlert = useCallback(async (id, status, extra = {}) => {
    try {
      await fetch(`${API}/api/ambulance/alerts/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      fetchDbAlerts();
    } catch {}
  }, [fetchDbAlerts]);

  // ── Mark fleet unit ──
  const markFleet = useCallback(async (id, status) => {
    try {
      await fetch(`${API}/api/ambulance/fleet/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchFleet();
    } catch {}
  }, [fetchFleet]);

  const displayETA = gpsETA !== null
    ? `${Math.floor(gpsETA)}:${String(Math.round((gpsETA%1)*60)).padStart(2,'0')}`
    : etaInput ? `${etaInput}:00` : '—:—';

  const routeOptions = recommendedDepts.length > 0
    ? recommendedDepts.map((d, i) => ({ name: d, status: i === 0 ? 'Primary' : 'Standby', dot: i === 0 ? 'bg-red-500' : 'bg-slate-400', text: i === 0 ? 'text-red-600' : 'text-slate-500' }))
    : [
      { name: 'OT Silver Cardiology', status: 'Primary',     dot: 'bg-red-500',    text: 'text-red-600' },
      { name: 'Lab Violet',           status: 'Standby',     dot: 'bg-violet-400', text: 'text-violet-600' },
      { name: 'Nursing Blue',         status: 'Prep',        dot: 'bg-blue-400',   text: 'text-blue-600' },
      { name: 'OPD Green',            status: 'NOT Alerted', dot: 'bg-slate-200',  text: 'text-slate-300', muted: true },
    ];

  const doctors = staff.filter(s => ['er_doctor','dept_head'].includes(s.role) && s.availability === 'Available');
  const nurses  = staff.filter(s => s.role === 'nurse' && s.availability === 'Available');

  return {
    // input
    conditionInput, setConditionInput, etaInput, setEtaInput,
    severity, setSeverity, additionalNotes, setAdditionalNotes,
    // voice/AI
    isListening, transcript, isProcessing, aiConfidence,
    aiPrep, clinicalNote, recommendedDepts,
    startVoice, stopVoice, autoFillWithAI,
    // alert
    alertStatus, blockchainTx, isSending, sendEmergencyAlert, patchAlert,
    // live data
    liveAlerts, dbAlerts, fleet, staff, doctors, nurses, alertsLoading,
    markFleet, fetchDbAlerts,
    // gps
    ambulancePos, gpsETA, gpsStatus, displayETA,
    // derived
    routeOptions,
  };
}
