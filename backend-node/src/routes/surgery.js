const router = require('express').Router();
const db     = require('../db/index');
const notif  = require('../services/notificationService');

router.get('/schedule', async (req, res, next) => {
  try {
    res.json({ surgeries: await db.all(`SELECT s.*, st.name as surgeon_name FROM surgeries s LEFT JOIN staff st ON s.surgeon_id=st.id ORDER BY CASE s.priority WHEN 'Emergency' THEN 1 WHEN 'Urgent' THEN 2 ELSE 3 END, s.scheduled_at ASC`) });
  } catch(e) { next(e); }
});

router.get('/ot-status', async (req, res, next) => {
  try {
    const rooms  = ['OT-01','OT-02','OT-03','OT-04','OT-05'];
    const active = await db.all(`SELECT ot_room,status,procedure,patient_name FROM surgeries WHERE status IN ('In Progress','Scheduled') ORDER BY scheduled_at`);
    const grid   = rooms.map(room => { const s=active.find(a=>a.ot_room===room); return { room, status:s?s.status:'Available', procedure:s?.procedure||null, patient:s?.patient_name||null }; });
    res.json({ ot_status:grid });
  } catch(e) { next(e); }
});

router.post('/procedure', async (req, res, next) => {
  try {
    const { patient_name, patient_id, surgeon_id, surgeon_name, ot_room, procedure, priority='Elective', eta_mins, scheduled_at } = req.body;
    const r = await db.run(`INSERT INTO surgeries (patient_id,patient_name,surgeon_id,surgeon_name,ot_room,procedure,priority,eta_mins,scheduled_at) VALUES (?,?,?,?,?,?,?,?,?)`,
      [patient_id||null, patient_name, surgeon_id||null, surgeon_name, ot_room, procedure, priority, eta_mins||null, scheduled_at||new Date().toISOString()]);
    if (priority==='Emergency') await notif.create({ type:'emergency', title:`🔪 Emergency Surgery — ${ot_room}`, message:`${procedure} for ${patient_name}. ETA ${eta_mins||'?'} min.`, department:'Surgery', target_role:'all' });
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const tsMap = { 'In Progress':'started_at', 'Completed':'ended_at' };
    let sql=`UPDATE surgeries SET status=?`; const vals=[status];
    if (tsMap[status]) { sql+=`,${tsMap[status]}=?`; vals.push(new Date().toISOString()); }
    sql+=` WHERE id=?`; vals.push(req.params.id);
    await db.run(sql, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
