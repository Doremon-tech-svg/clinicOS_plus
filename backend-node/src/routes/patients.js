const router = require('express').Router();
const db     = require('../db/index');
const { predictDischarge } = require('../services/aiService');

router.get('/', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, department, status } = req.query;
    let sql = `SELECT p.*, s.name as doctor_name FROM patients p LEFT JOIN staff s ON p.attending_doctor_id = s.id WHERE 1=1`;
    const params = [];
    if (department) { sql += ` AND p.department=?`; params.push(department); }
    if (status)     { sql += ` AND p.status=?`;     params.push(status);     }
    sql += ` ORDER BY p.risk_score DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    const patients = await db.all(sql, params);
    const { c: total } = await db.get(`SELECT COUNT(*) as c FROM patients`);
    res.json({ patients, total, limit: Number(limit), offset: Number(offset) });
  } catch(e) { next(e); }
});

router.get('/bed-optimizer/predict', async (req, res, next) => {
  try {
    const patients = await db.all(`SELECT id,name,mrn,bed,ward,diagnosis,risk_label,admitted_at FROM patients WHERE discharged_at IS NULL`);
    const preds    = await predictDischarge(patients);
    const merged   = patients.map(p => ({ ...p, ...(preds.find(x => x.id === p.id) || { predicted_discharge_days:3, discharge_estimate:'3 days' }) }));
    res.json({ patients: merged, total: merged.length, agent:'Bed Flow Optimizer (Groq)' });
  } catch(e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await db.get(`SELECT p.*, s.name as doctor_name FROM patients p LEFT JOIN staff s ON p.attending_doctor_id=s.id WHERE p.id=?`, [req.params.id]);
    if (!p) return res.status(404).json({ error:'Patient not found' });
    res.json(p);
  } catch(e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const fields  = ['hr','bp','spo2','temp','status','diagnosis','risk_score','risk_label'];
    const updates = []; const vals = [];
    for (const f of fields) if (req.body[f] !== undefined) { updates.push(`${f}=?`); vals.push(req.body[f]); }
    if (!updates.length) return res.status(400).json({ error:'No valid fields' });
    vals.push(req.params.id);
    await db.run(`UPDATE patients SET ${updates.join(',')} WHERE id=?`, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
