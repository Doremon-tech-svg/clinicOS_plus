require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Key pools ─────────────────────────────────────────────
const GROQ_KEYS   = [process.env.GROQ_KEY_1, process.env.GROQ_KEY_2].filter(Boolean);
const GEMINI_KEYS = [process.env.GEMINI_KEY_1, process.env.GEMINI_KEY_2].filter(Boolean);

let groqIdx   = 0;
let geminiIdx = 0;

// ── Helpers ───────────────────────────────────────────────
function parseJSON(raw) {
  if (!raw) return null;
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```json?\n?/, '').replace(/```$/, '').trim();
  }
  try { return JSON.parse(text); } catch { return null; }
}

// ── Gemini fallback ───────────────────────────────────────
async function callGemini(prompt) {
  if (!GEMINI_KEYS.length) return null;
  for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
    const key = GEMINI_KEYS[(geminiIdx + attempt) % GEMINI_KEYS.length];
    try {
      const genai  = new GoogleGenerativeAI(key);
      const model  = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      geminiIdx = (geminiIdx + attempt + 1) % GEMINI_KEYS.length;
      return result.response.text();
    } catch (e) {
      if (e.status === 429 || e.message?.includes('quota')) continue;
      console.error('[Gemini] error:', e.message);
    }
  }
  return null;
}

// ── Primary: Groq ─────────────────────────────────────────
async function callGroq(prompt, maxTokens = 800) {
  if (!GROQ_KEYS.length) return callGemini(prompt);
  for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
    const key = GROQ_KEYS[(groqIdx + attempt) % GROQ_KEYS.length];
    try {
      const client = new Groq({ apiKey: key });
      const resp   = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });
      groqIdx = (groqIdx + attempt + 1) % GROQ_KEYS.length;
      return resp.choices[0].message.content.trim();
    } catch (e) {
      if (e.status === 429) {
        console.warn(`[Groq] Key ${attempt + 1} rate-limited, trying next…`);
        continue;
      }
      console.error('[Groq] error:', e.message);
    }
  }
  // All Groq keys exhausted → Gemini
  console.warn('[AI] All Groq keys exhausted, falling back to Gemini…');
  return callGemini(prompt);
}

// ── Exported AI functions ─────────────────────────────────

const DEPTS = 'Cardiology, Trauma, Orthopaedics, ICU, Surgery, Nursing, Maternity, NICU, Lab, Emergency, Triage, Neurology, Radiology, General';

/**
 * Parse paramedic voice/text command → triage JSON
 * Alerts the right department, doctors, nurses based on condition
 */
async function parseParamedicCommand(text) {
  const prompt = `You are a medical triage AI for Apex Medical Center, New Delhi.
A paramedic reports: "${text}"

Respond ONLY with valid JSON (no markdown):
{
  "condition_summary": "Brief clinical condition (max 60 chars)",
  "severity": "Critical",
  "departments": ["Emergency","Cardiology"],
  "alert_roles": ["er_doctor","nurse","acc"],
  "preparation": ["Prep item 1","Prep item 2","Prep item 3"],
  "vital_monitoring": ["BP every 2 min","O2 sat continuous"],
  "clinical_note": "2-3 sentence handover note for receiving nurse",
  "suggested_eta": 10,
  "confidence": 94
}

Rules:
- severity: exactly Critical | Moderate | Stable
- departments: subset of: ${DEPTS}
- alert_roles: roles to notify — acc, er_doctor, dept_head, nurse (pick relevant ones)
- preparation: 3-5 SPECIFIC actionable items
- clinical_note: concise handover for nurse`;

  const raw  = await callGroq(prompt, 900);
  const data = parseJSON(raw);
  return { data, model: raw ? 'groq' : 'gemini', raw };
}

/**
 * Generate realistic live alert feed
 */
async function generateLiveAlerts() {
  const prompt = `Generate 5 realistic emergency ambulance dispatch alerts at Apex Medical Center, New Delhi.
Return ONLY a JSON array (no markdown):
[{"unit":"Unit 3-Alpha","incident":"Acute STEMI","status":"En Route","severity":"Critical","eta":"4 min","time":"14:23:07","department":"Cardiology"}]
Status options: En Route | Arrived | Dispatched
Severity options: Critical | Moderate | Stable
Make incidents varied: cardiac, trauma, obstetric, neuro, pediatric.`;

  const raw    = await callGroq(prompt, 600);
  const result = parseJSON(raw);
  return Array.isArray(result) ? result : [];
}

/**
 * AI bed discharge prediction (replaces ML model)
 */
async function predictDischarge(patients) {
  const prompt = `You are a hospital bed flow optimizer for Apex Medical Center.
Given these admitted patients, predict discharge timeline for each.
Patients: ${JSON.stringify(patients.map(p => ({ id: p.id, diagnosis: p.diagnosis, risk_label: p.risk_label, admitted_at: p.admitted_at })))}

Return ONLY a JSON array (no markdown):
[{"id": 1, "predicted_discharge_days": 2, "discharge_estimate": "2 days", "reasoning": "brief reason"}]`;

  const raw    = await callGroq(prompt, 800);
  const result = parseJSON(raw);
  return Array.isArray(result) ? result : [];
}

/**
 * OPD AI priority scoring
 */
async function scoreOpdPriority(patients) {
  const prompt = `You are an OPD triage AI. Score priority for each waiting patient.
Patients: ${JSON.stringify(patients)}
Return ONLY a JSON array: [{"token":"G-1102","ai_priority":"High","reason":"brief"}]
Priority: High | Medium | Low`;

  const raw    = await callGroq(prompt, 400);
  const result = parseJSON(raw);
  return Array.isArray(result) ? result : [];
}

module.exports = { parseParamedicCommand, generateLiveAlerts, predictDischarge, scoreOpdPriority, callGroq, parseJSON };
