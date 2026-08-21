const router = require('express').Router();
const db     = require('../db/index');
const { parseParamedicCommand, generateLiveAlerts } = require('../services/aiService');
const notif  = require('../services/notificationService');
const crypto = require('crypto');

let _alertsCache = { data:[], ts:0 };
const ALERT_TTL  = 60_000;

// POST /api/emergency/parse-condition
router.post('/parse-condition', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error:'text required' });
    const { data, model } = await parseParamedicCommand(text);
    if (!data) return res.json({ condition_summary:text.slice(0,60), severity:'Moderate', departments:['Emergency'], alert_roles:['er_doctor'], preparation:[], clinical_note:'', suggested_eta:10, confidence:60, source:'fallback' });
    const tx = '0x'+crypto.createHash('sha256').update(text+Date.now()).digest('hex').slice(0,40);
    await db.run(`INSERT INTO ai_audit_trail (decision_type,input_text,ai_output,confidence,model_used,blockchain_tx) VALUES (?,?,?,?,?,?)`,
      ['triage', text, JSON.stringify(data), data.confidence||90, model, tx]);
    res.json({ ...data, source:model });
  } catch(e) { next(e); }
});

// POST /api/ambulance/alert
router.post('/alert', async (req, res, next) => {
  try {
    const { condition, eta, severity='Moderate', preparation=[], clinical_note='', departments=[], paramedic_id, ambulance_unit, gps_lat, gps_lng, ai_confidence } = req.body;
    if (!condition||!eta) return res.status(400).json({ error:'condition and eta required' });
    const tx = '0x'+crypto.createHash('sha256').update(condition+eta+Date.now()).digest('hex').slice(0,40);
    const r  = await db.run(
      `INSERT INTO emergency_alerts (paramedic_id,ambulance_unit,condition_summary,severity,departments,preparation,clinical_note,eta_minutes,gps_lat,gps_lng,status,blockchain_tx,ai_confidence) VALUES (?,?,?,?,?,?,?,?,?,?,'Dispatched',?,?)`,
      [paramedic_id||null, ambulance_unit||'Unknown', condition, severity, JSON.stringify(departments), JSON.stringify(preparation), clinical_note, Number(eta), gps_lat||null, gps_lng||null, tx, ai_confidence||null]
    );
    await notif.create({ type:'emergency', title:`🚨 ${severity} Alert — ${ambulance_unit||'Ambulance'}`, message:`${condition}. ETA ${eta} min.`, department:departments[0]||'Emergency', target_role:'all' });
    await db.run(`INSERT INTO audit_logs (action,patient_name,details,tx_hash) VALUES (?,?,?,?)`, ['AmbulanceAlert','Incoming',`Condition:${condition}|ETA:${eta}min`, tx]);
    res.json({ success:true, alert_id:r.lastInsertRowid, blockchain_tx:tx, departments });
  } catch(e) { next(e); }
});

// GET /api/ambulance/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await db.all(`SELECT ea.*, s.name as paramedic_name FROM emergency_alerts ea LEFT JOIN staff s ON ea.paramedic_id=s.id ORDER BY ea.dispatched_at DESC LIMIT 20`);
    res.json({ alerts: alerts.map(a => ({ ...a, departments:JSON.parse(a.departments||'[]'), preparation:JSON.parse(a.preparation||'[]') })) });
  } catch(e) { next(e); }
});

// PATCH /api/ambulance/alerts/:id
router.patch('/alerts/:id', async (req, res, next) => {
  try {
    const { status, assigned_doctor_id } = req.body;
    const now = new Date().toISOString();
    const tsField = status==='Acknowledged'?'acknowledged_at':status==='Arrived'?'arrived_at':status==='Completed'?'completed_at':null;
    let sql = `UPDATE emergency_alerts SET status=?`; const vals = [status];
    if (tsField)            { sql+=`,${tsField}=?`; vals.push(now); }
    if (assigned_doctor_id) { sql+=`,assigned_doctor_id=?`; vals.push(assigned_doctor_id); }
    sql+=` WHERE id=?`; vals.push(req.params.id);
    await db.run(sql, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// GET /api/live-alerts
router.get('/live-alerts', async (req, res, next) => {
  try {
    const now = Date.now();
    if (_alertsCache.data.length && now - _alertsCache.ts < ALERT_TTL) return res.json({ alerts:_alertsCache.data, source:'cache' });
    const alerts   = await generateLiveAlerts();
    const fallback = [
      { unit:'Unit 1-Alpha', incident:'Cardiac Arrest',       status:'En Route', severity:'Critical', eta:'3 min', time:new Date().toLocaleTimeString(), department:'Cardiology' },
      { unit:'Unit 4-Delta', incident:'Trauma Level II',      status:'Arrived',  severity:'Critical', eta:'0 min', time:new Date().toLocaleTimeString(), department:'Trauma'    },
      { unit:'Unit 3-Charlie',incident:'Preterm Labour (32w)',status:'En Route', severity:'Moderate', eta:'8 min', time:new Date().toLocaleTimeString(), department:'Maternity' },
    ];
    const data = alerts.length ? alerts : fallback;
    _alertsCache = { data, ts:now };
    res.json({ alerts:data, source:alerts.length?'groq':'fallback' });
  } catch(e) { next(e); }
});

// GET /api/ambulance/fleet
router.get('/fleet', async (req, res, next) => {
  try {
    const fleet = await db.all(`SELECT a.*, s.name as paramedic_name FROM ambulances a LEFT JOIN staff s ON a.paramedic_id=s.id ORDER BY CASE a.status WHEN 'Available' THEN 0 WHEN 'Busy' THEN 1 ELSE 2 END, a.unit_name`);
    res.json({ fleet });
  } catch(e) { next(e); }
});

// PATCH /api/ambulance/fleet/:id
router.patch('/fleet/:id', async (req, res, next) => {
  try {
    const { status, driver_name, driver_phone, paramedic_id } = req.body;
    const fields = []; const vals = [];
    if (status !== undefined)       { fields.push('status=?');       vals.push(status); }
    if (driver_name !== undefined)  { fields.push('driver_name=?');  vals.push(driver_name); }
    if (driver_phone !== undefined) { fields.push('driver_phone=?'); vals.push(driver_phone); }
    if (paramedic_id !== undefined) { fields.push('paramedic_id=?'); vals.push(paramedic_id); }
    if (!fields.length) return res.status(400).json({ error:'nothing to update' });
    fields.push("updated_at=datetime('now')");
    vals.push(req.params.id);
    await db.run(`UPDATE ambulances SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// POST /api/ambulance/fleet (add new unit)
router.post('/fleet', async (req, res, next) => {
  try {
    const { unit_name, vehicle_reg='', vehicle_type='BLS', driver_name='', driver_phone='', hospital_id=1 } = req.body;
    if (!unit_name) return res.status(400).json({ error:'unit_name required' });
    const r = await db.run(
      `INSERT INTO ambulances (hospital_id,unit_name,vehicle_reg,vehicle_type,status,driver_name,driver_phone) VALUES (?,?,?,?,'Available',?,?)`,
      [hospital_id, unit_name, vehicle_reg, vehicle_type, driver_name, driver_phone]
    );
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

// DELETE /api/ambulance/fleet/:id
router.delete('/fleet/:id', async (req, res, next) => {
  try {
    await db.run(`DELETE FROM ambulances WHERE id=?`, [req.params.id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// POST /api/ambulance/dispatch — dispatcher sends ambulance to location
router.post('/dispatch', async (req, res, next) => {
  try {
    const { ambulance_id, location, condition, eta=10, severity='Moderate', paramedic_id } = req.body;
    if (!ambulance_id || !location) return res.status(400).json({ error:'ambulance_id and location required' });
    const amb = await db.get(`SELECT * FROM ambulances WHERE id=?`, [ambulance_id]);
    if (!amb) return res.status(404).json({ error:'ambulance not found' });
    const tx = '0x'+crypto.createHash('sha256').update(location+ambulance_id+Date.now()).digest('hex').slice(0,40);
    const r = await db.run(
      `INSERT INTO emergency_alerts (ambulance_id,ambulance_unit,condition_summary,severity,dispatched_location,eta_minutes,assigned_paramedic_id,status,blockchain_tx,departments,preparation) VALUES (?,?,?,?,?,?,?,'Dispatched',?,'[]','[]')`,
      [ambulance_id, amb.unit_name, condition||'Dispatch run', severity, location, eta, paramedic_id||amb.paramedic_id||null, tx]
    );
    await db.run(`UPDATE ambulances SET status='Busy', current_alert_id=?, updated_at=datetime('now') WHERE id=?`, [r.lastInsertRowid, ambulance_id]);
    // Notify paramedic
    await notif.create({ type:'dispatch', title:`🚑 Dispatch — ${amb.unit_name}`, message:`Location: ${location}. ETA ~${eta} min. Condition: ${condition||'N/A'}`, department:'Emergency', target_role:'paramedic', target_user_id: paramedic_id||null });
    res.json({ success:true, alert_id:r.lastInsertRowid, ambulance:amb.unit_name, blockchain_tx:tx });
  } catch(e) { next(e); }
});

// GET /api/ambulance/dispatch/my — paramedic polls their active run
router.get('/dispatch/my', async (req, res, next) => {
  try {
    const { paramedic_id } = req.query;
    if (!paramedic_id) return res.json({ run:null });
    const run = await db.get(
      `SELECT ea.*, a.unit_name, a.vehicle_type FROM emergency_alerts ea LEFT JOIN ambulances a ON ea.ambulance_id=a.id WHERE ea.assigned_paramedic_id=? AND ea.status NOT IN ('Completed') ORDER BY ea.dispatched_at DESC LIMIT 1`,
      [paramedic_id]
    );
    if (run) { run.departments = JSON.parse(run.departments||'[]'); run.preparation = JSON.parse(run.preparation||'[]'); }
    res.json({ run: run || null });
  } catch(e) { next(e); }
});

module.exports = router;
