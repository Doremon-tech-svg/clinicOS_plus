const router = require('express').Router();
const db     = require('../db/index');
const notif  = require('../services/notificationService');

router.get('/tests', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    let sql = `SELECT * FROM lab_tests WHERE 1=1`; const params = [];
    if (status)   { sql+=` AND status=?`;   params.push(status);   }
    if (priority) { sql+=` AND priority=?`; params.push(priority); }
    sql += ` ORDER BY CASE priority WHEN 'Stat' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, ordered_at ASC`;
    res.json({ tests: await db.all(sql, params) });
  } catch(e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const rows    = await db.all(`SELECT status, COUNT(*) as count FROM lab_tests GROUP BY status`);
    const map     = { Pending:0, 'In Progress':0, Completed:0 };
    rows.forEach(r => { map[r.status] = r.count; });
    const flagged = (await db.get(`SELECT COUNT(*) as c FROM lab_tests WHERE flagged=1`)).c;
    res.json({ ...map, Flagged: flagged });
  } catch(e) { next(e); }
});

router.post('/tests', async (req, res, next) => {
  try {
    const { patient_name, patient_room, test_name, test_type='Blood', priority='Normal', ordered_by, patient_id } = req.body;
    const r = await db.run(`INSERT INTO lab_tests (patient_id,patient_name,patient_room,test_name,test_type,priority,ordered_by) VALUES (?,?,?,?,?,?,?)`,
      [patient_id||null, patient_name, patient_room, test_name, test_type, priority, ordered_by||null]);
    if (priority==='Stat') await notif.create({ type:'lab', title:`🧪 STAT Lab — ${test_name}`, message:`Patient: ${patient_name}, Room: ${patient_room}`, department:'Laboratory', target_role:'lab_tech' });
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

router.patch('/tests/:id', async (req, res, next) => {
  try {
    const { status, result, flagged } = req.body;
    const updates=[]; const vals=[];
    if (status  !== undefined) { updates.push('status=?');  vals.push(status);  }
    if (result  !== undefined) { updates.push('result=?');  vals.push(result);  }
    if (flagged !== undefined) { updates.push('flagged=?'); vals.push(flagged?1:0); }
    if (status==='Completed')  { updates.push(`completed_at=datetime('now')`); }
    if (!updates.length) return res.status(400).json({ error:'Nothing to update' });
    vals.push(req.params.id);
    await db.run(`UPDATE lab_tests SET ${updates.join(',')} WHERE id=?`, vals);
    if (flagged) {
      const t = await db.get(`SELECT * FROM lab_tests WHERE id=?`, [req.params.id]);
      await notif.create({ type:'lab', title:`🔴 Critical Result`, message:`${t?.patient_name} — ${t?.test_name}: ${result}`, department:'Laboratory', target_role:'er_doctor' });
    }
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
