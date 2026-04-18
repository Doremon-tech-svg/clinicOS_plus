"""
main.py — FastAPI backend for Intelligent Healthcare Ecosystem
Endpoints:
  GET  /api/patients
  POST /api/voice/command
  POST /api/ambulance/alert
  GET  /api/blockchain/events
  POST /api/patient/consent
  POST /api/parse-condition   ← powered by Groq (llama-3.3-70b-versatile, free)
  GET  /api/live-alerts       ← Groq-generated live feed, cached 60s

Replace Anthropic with Groq:
  pip install groq
  Set env var: GROQ_API_KEY=your_key_here  (get free at https://console.groq.com)
"""

import os
import json
import time
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional, List

from groq import Groq                          # ← replaces: import anthropic
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from predict_bed_flow_v2 import get_all_patients, get_patients_count

from telegram_bot import send_alert_async
from database import engine, get_db
import models
from predict import predict_risk
import blockchain_client as bc
from predict_bed_flow import predict_discharge_days


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

# ── Groq client ───────────────────────────────────────────────────────────────
# Free tier: https://console.groq.com — 14,400 req/day on llama-3.3-70b
_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = "llama-3.3-70b-versatile"         # best free model on Groq

# ── Live-alert cache (TTL = 60 s) ────────────────────────────────────────────
_alerts_cache: dict = {"data": [], "ts": 0.0}
ALERT_TTL = 60

app = FastAPI(
    title="Intelligent Healthcare Ecosystem API",
    description="5-Agent AI + Blockchain Healthcare Backend",
    version="2.0.0",
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during setup; restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ──────────────────────────────────────────────────────────────────

def generate_mock_blockchain_events():
    now = int(datetime.now(timezone.utc).timestamp() * 1000)
    return [
        {"timestamp": now - 120000, "action": "ConsentGranted",   "patient": "Priya Sharma",
         "txHash": "0x" + hashlib.sha256(b"a1").hexdigest()[:40]},
        {"timestamp": now - 300000, "action": "AccessLogged",     "patient": "Rajesh Kumar",
         "txHash": "0x" + hashlib.sha256(b"b2").hexdigest()[:40]},
        {"timestamp": now - 600000, "action": "ConsentRevoked",   "patient": "Meena Devi",
         "txHash": "0x" + hashlib.sha256(b"c3").hexdigest()[:40]},
        {"timestamp": now - 900000, "action": "ConsentGranted",   "patient": "Arun Verma",
         "txHash": "0x" + hashlib.sha256(b"d4").hexdigest()[:40]},
        {"timestamp": now - 1200000,"action": "AccessLogged",     "patient": "Sunita Patel",
         "txHash": "0x" + hashlib.sha256(b"e5").hexdigest()[:40]},
    ]


# ── AI helpers ────────────────────────────────────────────────────────────────

AVAILABLE_DEPTS = (
    "Cardiology, Trauma, Orthopaedics, ICU, Surgery, "
    "Nursing, Maternity, NICU, Lab, Emergency, Triage, Neurology"
)

def _groq_chat(prompt: str, max_tokens: int = 800) -> str | None:
    """
    Thin wrapper around Groq chat completion.
    Returns the assistant text or None on failure.
    Note: Groq client is synchronous — wrap in executor if called from async context.
    """
    try:
        resp = _groq.chat.completions.create(
            model=GROQ_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        return None


def _parse_json_response(raw: str | None) -> dict | list | None:
    """Strip markdown fences and parse JSON safely."""
    if not raw:
        return None
    text = raw.strip()
    if text.startswith("```"):
        # remove opening fence
        text = text.split("```", 1)[1]
        if text.startswith("json"):
            text = text[4:]
        # remove closing fence
        if "```" in text:
            text = text.rsplit("```", 1)[0]
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e} | raw: {raw[:200]}")
        return None


async def ai_parse_condition(text: str) -> dict | None:
    """Call Groq to do a full medical triage of the spoken/typed condition."""
    prompt = f"""You are a medical triage AI agent embedded in an ambulance dispatch system in India.
A paramedic reports: "{text}"

Analyze this and respond ONLY with valid JSON — no markdown, no explanation:
{{
  "condition_summary": "Brief clear medical condition (max 60 chars)",
  "severity": "Critical",
  "departments": ["Emergency"],
  "preparation": ["Specific prep item 1", "Specific prep item 2", "Specific prep item 3"],
  "vital_monitoring": ["BP every 2 min", "O2 sat continuous"],
  "clinical_note": "2-3 sentence clinical note for the receiving nurse",
  "suggested_eta": 10,
  "confidence": 94
}}

severity must be exactly one of: Critical | Moderate | Stable
departments must be a subset of: {AVAILABLE_DEPTS}
preparation: 3-5 SPECIFIC actionable items the hospital team must prepare before patient arrives.
clinical_note: concise clinical handover note for the nurse receiving this patient."""

    

    import asyncio
    loop = asyncio.get_event_loop()
    raw = await loop.run_in_executor(None, lambda: _groq_chat(prompt, 800))
    return _parse_json_response(raw)

class PatientQueryParams(BaseModel):
    limit: int = 20
    offset: int = 0

def keyword_triage(condition: str) -> list:
    """Fallback keyword-based department routing."""
    c = condition.lower()
    if any(k in c for k in ["chest pain", "cardiac", "heart attack", "mi", "angina", "palpitation"]):
        return ["Cardiology", "ICU"]
    if any(k in c for k in ["accident", "trauma", "fracture", "injury", "fall", "crush", "head injury"]):
        return ["Trauma", "Orthopaedics", "ICU"]
    if any(k in c for k in ["pregnancy", "labour", "labor", "maternity", "delivery", "baby", "prenatal"]):
        return ["Maternity", "NICU"]
    if any(k in c for k in ["blood", "lab", "fever", "infection", "sepsis", "test"]):
        return ["Emergency", "Lab"]
    if any(k in c for k in ["stroke", "neuro", "brain", "seizure"]):
        return ["Neurology", "ICU"]
    return ["Emergency", "Triage"]


async def generate_live_alerts_via_groq() -> list:
    """Ask Groq for 5 realistic active dispatch scenarios."""
    prompt = """Generate 5 realistic emergency ambulance dispatch alerts currently active at a large Delhi hospital.
Return ONLY a JSON array — no markdown, no explanation:
[
  {
    "unit": "Unit 3-Alpha",
    "incident": "Acute STEMI with cardiogenic shock",
    "status": "En Route",
    "severity": "Critical",
    "eta": "4 min",
    "time": "14:23:07",
    "department": "Cardiology"
  }
]
Make incidents realistic and varied: include cardiac, trauma, obstetric, neuro, and pediatric cases.
status options: En Route | Arrived | Dispatched
severity options: Critical | Moderate | Stable"""

    import asyncio
    loop = asyncio.get_event_loop()
    raw = await loop.run_in_executor(None, lambda: _groq_chat(prompt, 600))
    result = _parse_json_response(raw)
    if isinstance(result, list):
        return result
    return []


FALLBACK_ALERTS = [
    {"unit": "Unit 7-Alpha", "incident": "Cardiac Arrest",        "status": "En Route",   "severity": "Critical", "eta": "3 min",  "time": "14:02:11", "department": "Cardiology"},
    {"unit": "Unit 4-Bravo", "incident": "Trauma Level II",       "status": "Arrived",    "severity": "Critical", "eta": "0 min",  "time": "13:45:02", "department": "Trauma"},
    {"unit": "Unit 2-Delta", "incident": "Preterm Labour (32w)",   "status": "En Route",   "severity": "Moderate", "eta": "8 min",  "time": "14:10:44", "department": "Maternity"},
    {"unit": "Unit 5-Echo",  "incident": "Ischaemic Stroke",      "status": "Dispatched", "severity": "Critical", "eta": "12 min", "time": "14:18:33", "department": "Neurology"},
    {"unit": "Unit 1-Foxt",  "incident": "Polytrauma — RTA",      "status": "En Route",   "severity": "Critical", "eta": "6 min",  "time": "14:21:55", "department": "Trauma"},
]

# ── Mock patients ─────────────────────────────────────────────────────────────

MOCK_PATIENTS = [
    {"id": 1, "name": "Mrs. Sharma", "mrn": "MRN-2024-00041", "age": 78, "bed": "4A",
     "ward": "Ward B", "diagnosis": "Hip fracture post-op",
     "patient_data": {"age": 78, "mobility_score": 3, "prior_falls": 2, "med_count": 7, "hr_variability": 32}},
    {"id": 2, "name": "Mr. Gupta",   "mrn": "MRN-2024-00082", "age": 45, "bed": "2B",
     "ward": "Ward B", "diagnosis": "Post-appendectomy",
     "patient_data": {"age": 45, "mobility_score": 8, "prior_falls": 0, "med_count": 2, "hr_variability": 65}},
    {"id": 3, "name": "Mr. Kapoor",  "mrn": "MRN-2024-00113", "age": 61, "bed": "6B",
     "ward": "Ward B", "diagnosis": "Hypertension management",
     "patient_data": {"age": 61, "mobility_score": 6, "prior_falls": 1, "med_count": 5, "hr_variability": 45}},
    {"id": 4, "name": "Mrs. Menon",  "mrn": "MRN-2024-00124", "age": 52, "bed": "3A",
     "ward": "Ward B", "diagnosis": "Diabetic care",
     "patient_data": {"age": 52, "mobility_score": 7, "prior_falls": 0, "med_count": 4, "hr_variability": 58}},
]

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ParseConditionRequest(BaseModel):
    text: str

class VoiceCommandRequest(BaseModel):
    command: str

class AmbulanceAlertRequest(BaseModel):
    condition:     str
    eta:           str
    severity:      str         = "Critical"
    preparation:   List[str]   = []
    clinical_note: str         = ""
    departments:   List[str]   = []

class ConsentRequest(BaseModel):
    department: str
    granted:    bool
    patient:    Optional[str] = "MRN-2024-08741"

# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "Intelligent Healthcare Ecosystem API", "version": "2.0.0"}

# @app.get("/api/bed-optimizer")
# def bed_optimizer(db: Session = Depends(get_db)):
#     """
#     Bed Flow Optimizer Agent: Predicts days until discharge for all patients.
#     Used by Admin Dashboard and Nursing Dashboard to display expected bed availability.
#     """
#     # Use patients from database (or fallback to MOCK_PATIENTS)
#     patients = db.query(models.Patient).all()
#     if not patients:
#         patients = MOCK_PATIENTS

#     result = []
#     for p in patients:
#         # Extract patient data for model (adapt based on your actual Patient model)
#         # For MOCK_PATIENTS, we have extra fields; for DB patients, use defaults
#         if isinstance(p, dict):  # Mock patient dict
#             patient_data = {
#                 "age": p.get("age", 60),
#                 "mobility_score": p.get("patient_data", {}).get("mobility_score", 5),
#                 "prior_falls": p.get("patient_data", {}).get("prior_falls", 0),
#                 "comorbidity_count": p.get("comorbidity_count", 1),
#                 "surgery_required": p.get("surgery_required", 0),
#                 "admission_type": p.get("admission_type", "Emergency"),
#             }
#             name = p.get("name", "Unknown")
#             bed = p.get("bed", "Unknown")
#         else:  # Database model
#             patient_data = {
#                 "age": p.age,
#                 "mobility_score": getattr(p, "mobility_score", 5),
#                 "prior_falls": getattr(p, "prior_falls", 0),
#                 "comorbidity_count": getattr(p, "comorbidity_count", 1),
#                 "surgery_required": getattr(p, "surgery_required", 0),
#                 "admission_type": getattr(p, "admission_type", "Emergency"),
#             }
#             name = p.name
#             bed = p.bed

#         try:
#             pred = predict_discharge_days(patient_data)
#             predicted_days = pred["predicted_days"]
#             discharge_text = pred["discharge_estimate"]
#         except Exception as e:
#             logger.warning(f"Bed flow prediction failed for {name}: {e}")
#             predicted_days = 3
#             discharge_text = "3 days"

#         result.append({
#             "id": p.id if hasattr(p, "id") else p.get("id"),
#             "name": name,
#             "bed": bed,
#             "predicted_discharge_days": predicted_days,
#             "discharge_estimate": discharge_text
#         })

#     return {"patients": result, "agent": "Bed Flow Optimizer"}
@app.get("/api/bed-optimizer")
def bed_optimizer(limit: int = 20, offset: int = 0):
    """
    Bed Flow Optimizer Agent: Returns paginated patients with predicted discharge days.
    """
    try:
        patients = get_all_patients(limit=limit, offset=offset)
        total = get_patients_count()
        return {
            "patients": patients,
            "total": total,
            "limit": limit,
            "offset": offset,
            "agent": "Bed Flow Optimizer v2"
        }
    except Exception as e:
        logger.error(f"Bed optimizer error: {e}")
        return {"patients": [], "error": str(e)}

# @app.get("/api/patients")
# def get_patients(db: Session = Depends(get_db)):
#     result = []
#     for p in MOCK_PATIENTS:
#         try:
#             prediction = predict_risk(p["patient_data"])
#         except Exception as e:
#             logger.warning(f"predict_risk failed for {p['name']}: {e}")
#             prediction = {"risk_score": 50, "risk_label": "Unknown", "explanation": []}
#         result.append({
#             **{k: p[k] for k in ("id", "name", "mrn", "age", "bed", "ward", "diagnosis")},
#             "risk_score":       prediction["risk_score"],
#             "risk_label":       prediction["risk_label"],
#             "shap_explanation": prediction["explanation"],
#         })
#     return {"patients": result, "agent": "Bed Flow Optimizer"}
@app.get("/api/patients")
def get_patients(limit: int = 20, offset: int = 0):
    """
    Returns paginated patients with AI-generated risk scores and vitals.
    """
    try:
        all_patients = get_all_patients(limit=limit, offset=offset)
        total = get_patients_count()
        result = []
        for p in all_patients:
            result.append({
                "id": p["id"],
                "name": p["name"],
                "mrn": p["mrn"],
                "age": p["age"],
                "bed": p["bed"],
                "ward": p["ward"],
                "room": p["room"],
                "diagnosis": p["diagnosis"],
                "risk_score": p["risk_score"],
                "risk_label": p["risk_label"],
                "shap_explanation": [],
                # Vitals
                "hr": p["hr"],
                "bp": p["bp"],
                "spo2": p["spo2"],
                "temp": p["temp"],
            })
        return {
            "patients": result,
            "total": total,
            "limit": limit,
            "offset": offset,
            "agent": "Bed Flow Optimizer v2"
        }
    except Exception as e:
        logger.error(f"Patients API error: {e}")
        return {"patients": [], "error": str(e)}
    
@app.post("/api/parse-condition")
async def parse_condition(req: ParseConditionRequest):
    """
    Triage AI Agent: deep medical analysis via Groq (llama-3.3-70b-versatile).
    Returns condition, severity, departments, preparation checklist, clinical note.
    Falls back to keyword parser if Groq is unavailable.
    """
    ai = await ai_parse_condition(req.text)

    if ai:
        return {
            "condition_summary": ai.get("condition_summary", req.text[:60]),
            "severity":          ai.get("severity",          "Moderate"),
            "departments":       ai.get("departments",       keyword_triage(req.text)),
            "preparation":       ai.get("preparation",       []),
            "vital_monitoring":  ai.get("vital_monitoring",  []),
            "clinical_note":     ai.get("clinical_note",     ""),
            "suggested_eta":     ai.get("suggested_eta",     10),
            "confidence":        ai.get("confidence",        90),
            "source":            "groq",
        }

    # Keyword fallback
    text = req.text.lower()
    if any(w in text for w in ["severe", "critical", "unconscious", "cardiac arrest", "heart attack"]):
        severity = "Critical"
    elif any(w in text for w in ["moderate", "fracture", "pain", "fever"]):
        severity = "Moderate"
    else:
        severity = "Stable"

    suggested_eta = (
        8  if ("cardiac" in text or "heart" in text) else
        12 if ("trauma" in text or "accident" in text) else
        15
    )

    return {
        "condition_summary": req.text[:60],
        "severity":          severity,
        "departments":       keyword_triage(req.text),
        "preparation":       [],
        "vital_monitoring":  [],
        "clinical_note":     "",
        "suggested_eta":     suggested_eta,
        "confidence":        72,
        "source":            "keyword_fallback",
    }


@app.post("/api/ambulance/alert")
async def ambulance_alert(
    req: AmbulanceAlertRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Triage NLP Agent: dispatch incoming patient to hospital departments.
    Sends enriched Telegram alert (with prep list + clinical note) and logs to blockchain.
    """
    departments   = req.departments if req.departments else keyword_triage(req.condition)
    triage_result = departments[0] if departments else "Emergency"

    try:
        tx_hash = bc.log_access("MRN-2024-00041", f"Ambulance alert: {req.condition} | ETA: {req.eta}min")
    except Exception as e:
        logger.error(f"Blockchain log failed: {e}")
        tx_hash = "0x" + hashlib.sha256((req.condition + req.eta).encode()).hexdigest()[:40]

    from telegram_bot import CHANNEL_IDS
    telegram_channels = [CHANNEL_IDS.get(d) for d in departments if CHANNEL_IDS.get(d)]

    audit = models.AuditLog(
        action="AmbulanceAlertDispatched",
        patient_name="Incoming via Ambulance",
        details=(
            f"Condition: {req.condition} | ETA: {req.eta}min | "
            f"Severity: {req.severity} | Departments: {', '.join(departments)}"
        ),
        tx_hash=tx_hash,
    )
    db.add(audit)
    db.commit()

    patient_info = {
        "condition":     req.condition,
        "severity":      req.severity,
        "preparation":   req.preparation,
        "clinical_note": req.clinical_note,
    }
    background_tasks.add_task(send_alert_async, departments, patient_info, req.eta)

    return {
        "success":           True,
        "triage_result":     triage_result,
        "departments":       departments,
        "telegram_channels": telegram_channels,
        "telegram_sent":     True,
        "blockchain_tx":     tx_hash,
        "agent":             "Triage NLP Agent",
    }


@app.get("/api/live-alerts")
async def live_alerts():
    """
    Returns a live-updated list of active ambulance dispatches.
    Groq generates realistic scenarios; result is cached for 60 seconds.
    """
    global _alerts_cache
    now = time.time()
    if _alerts_cache["data"] and (now - _alerts_cache["ts"]) < ALERT_TTL:
        return {"alerts": _alerts_cache["data"], "source": "cache"}

    alerts = await generate_live_alerts_via_groq()
    if not alerts:
        alerts = FALLBACK_ALERTS

    _alerts_cache = {"data": alerts, "ts": now}
    return {"alerts": alerts, "source": "groq"}


@app.get("/api/blockchain/events")
def blockchain_events(db: Session = Depends(get_db)):
    db_logs = db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(10).all()
    events = []
    for log in db_logs:
        ts = log.timestamp
        if ts:
            ts_ms = int(ts.replace(tzinfo=timezone.utc).timestamp() * 1000) if ts.tzinfo is None else int(ts.timestamp() * 1000)
        else:
            ts_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
        events.append({
            "timestamp": ts_ms,
            "action":    log.action,
            "patient":   log.patient_name or "Unknown",
            "txHash":    log.tx_hash or "0x" + hashlib.sha256(str(log.id).encode()).hexdigest()[:40],
        })
    if len(events) < 5:
        events = (events + generate_mock_blockchain_events())[:8]
    return {"events": events, "source": "hybrid"}


@app.post("/api/voice/command")
def voice_command(req: VoiceCommandRequest, db: Session = Depends(get_db)):
    command    = req.command.lower()
    task       = "Unknown task"
    department = "Grey (Cleaning)"

    if "wheelchair" in command:
        bed_num    = "".join(filter(str.isdigit, command)) or "?"
        task       = f"Wheelchair requested for Bed {bed_num}"
    elif "medication" in command or "medicine" in command:
        task       = "Medication dispatch requested"
        department = "Orange (Pharmacy)"
    elif "clean" in command or "mop" in command:
        task       = "Cleaning/sanitation requested"
    elif "oxygen" in command or "o2" in command:
        task       = "Oxygen supply requested"
        department = "ICU / Respiratory"
    elif "meal" in command or "food" in command:
        task       = "Meal/dietary request"
        department = "Catering"
    elif "ecg" in command or "ekg" in command:
        task       = "ECG machine requested"
        department = "Cardiology"
    elif "blood test" in command or "sample" in command:
        task       = "Blood sample collection requested"
        department = "Violet (Lab)"

    try:
        tx_hash = bc.log_access("MRN-2024-00041", f"Voice command: {command}")
    except Exception as e:
        tx_hash = "0x" + hashlib.sha256(command.encode()).hexdigest()[:40]

    db.add(models.VoiceCommandLog(command=req.command, task=task, department=department, success=True))
    db.add(models.AuditLog(action="VoiceCommandLogged", patient_name="Nurse Station",
                            details=f"{task} → {department}", tx_hash=tx_hash))
    db.commit()
    return {"success": True, "task": task, "department": department, "tx_hash": tx_hash, "agent": "Nurse Assistant Agent"}


@app.post("/api/patient/consent")
def patient_consent(req: ConsentRequest, db: Session = Depends(get_db)):
    action = "ConsentGranted" if req.granted else "ConsentRevoked"
    try:
        PROVIDER_ADDRESS = bc.w3.eth.accounts[0]
        tx_hash = bc.grant_consent(req.patient, PROVIDER_ADDRESS, 86400, req.department) if req.granted else bc.revoke_consent(req.patient, PROVIDER_ADDRESS)
    except Exception as e:
        tx_hash = "0x" + hashlib.sha256(f"{req.patient}:{req.department}:{req.granted}".encode()).hexdigest()[:40]

    db.add(models.ConsentRecord(patient_mrn=req.patient, department=req.department, granted=req.granted, tx_hash=tx_hash))
    db.add(models.AuditLog(action=action, patient_name=req.patient, details=f"Department: {req.department}", tx_hash=tx_hash))
    db.commit()
    return {"success": True, "action": action, "department": req.department, "patient": req.patient, "tx_hash": tx_hash, "agent": "Decision Support Agent"}


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)