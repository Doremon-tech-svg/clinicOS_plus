const router = require('express').Router();
const db     = require('../db/index');
const notif  = require('../services/notificationService');

router.get('/queue', async (req, res, next) => {
  try {
    res.json({ queue: await db.all(`SELECT q.*, s.name as doctor_name FROM opd_queue q LEFT JOIN staff s ON q.doctor_id=s.id WHERE q.status IN ('Waiting','With Doctor') ORDER BY CASE q.ai_priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, q.checked_in_at ASC`) });
  } catch(e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const total   = (await db.get(`SELECT COUNT(*) as c FROM opd_queue WHERE date(checked_in_at)=date('now')`)).c;
    const waiting = (await db.get(`SELECT COUNT(*) as c FROM opd_queue WHERE status='Waiting'`)).c;
    const avg     = (await db.get(`SELECT AVG(wait_mins) as avg FROM opd_queue WHERE status='Waiting'`)).avg;
    res.json({ total, waiting, avgWait:Math.round(avg||0) });
  } catch(e) { next(e); }
});

router.get('/doctors', async (req, res, next) => {
  try {
    res.json({ doctors: await db.all(`SELECT s.*, COUNT(q.id) as seen_today FROM staff s LEFT JOIN opd_queue q ON q.doctor_id=s.id AND q.status='Completed' AND date(q.seen_at)=date('now') WHERE s.role IN ('er_doctor','dept_head') GROUP BY s.id ORDER BY s.department`) });
  } catch(e) { next(e); }
});

router.post('/checkin', async (req, res, next) => {
  try {
    const { patient_name, age, department, doctor_id } = req.body;
    const token = `${(department||'G').slice(0,1).toUpperCase()}-${Math.floor(1000+Math.random()*9000)}`;
    const r = await db.run(`INSERT INTO opd_queue (token,patient_name,age,department,doctor_id,wait_mins,ai_priority) VALUES (?,?,?,?,?,?,?)`,
      [token, patient_name, age||null, department, doctor_id||null, 0, 'Normal']);
    res.json({ success:true, token, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

router.patch('/queue/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    let sql=`UPDATE opd_queue SET status=?`; const vals=[status];
    if (status==='Completed') { sql+=`,seen_at=datetime('now')`; }
    sql+=` WHERE id=?`; vals.push(req.params.id);
    await db.run(sql, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
