const router = require('express').Router();
const db     = require('../db/index');
const notif  = require('../services/notificationService');

router.get('/scans', async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql=`SELECT r.*, s.name as radiologist_name FROM radiology_scans r LEFT JOIN staff s ON r.radiologist_id=s.id WHERE 1=1`; const params=[];
    if (status) { sql+=` AND r.status=?`; params.push(status); }
    sql+=` ORDER BY CASE r.priority WHEN 'Stat' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, r.scheduled_at ASC`;
    res.json({ scans: await db.all(sql, params) });
  } catch(e) { next(e); }
});

router.post('/scans', async (req, res, next) => {
  try {
    const { patient_name, patient_room, patient_id, scan_type, body_part, ordered_by, priority='Routine' } = req.body;
    const r = await db.run(`INSERT INTO radiology_scans (patient_id,patient_name,patient_room,scan_type,body_part,ordered_by,priority) VALUES (?,?,?,?,?,?,?)`,
      [patient_id||null, patient_name, patient_room, scan_type, body_part, ordered_by||null, priority]);
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

router.patch('/scans/:id', async (req, res, next) => {
  try {
    const { status, report } = req.body;
    const updates=[]; const vals=[];
    if (status !== undefined) { updates.push('status=?'); vals.push(status); }
    if (report !== undefined) { updates.push('report=?'); vals.push(report); }
    if (status==='Reported')  { updates.push(`reported_at=datetime('now')`); }
    if (!updates.length) return res.status(400).json({ error:'Nothing to update' });
    vals.push(req.params.id);
    await db.run(`UPDATE radiology_scans SET ${updates.join(',')} WHERE id=?`, vals);
    if (status==='Flagged') {
      const s = await db.get(`SELECT * FROM radiology_scans WHERE id=?`, [req.params.id]);
      await notif.create({ type:'lab', title:`🔴 Radiology Flag — ${s?.scan_type}`, message:`${s?.patient_name}: ${report||'Critical finding'}`, department:'Radiology', target_role:'er_doctor' });
    }
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
