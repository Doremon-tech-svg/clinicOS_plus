const router = require('express').Router();
const db     = require('../db/index');

router.get('/patients', async (req, res, next) => {
  try {
    res.json({ patients: await db.all(`SELECT m.*, s.name as doctor_name FROM maternity_patients m LEFT JOIN staff s ON m.doctor_id=s.id ORDER BY m.admitted_at DESC`) });
  } catch(e) { next(e); }
});

router.get('/stats', async (req, res, next) => {
  try {
    const stats = await db.all(`SELECT status, COUNT(*) as count FROM maternity_patients GROUP BY status`);
    const nicu  = (await db.get(`SELECT COUNT(*) as c FROM maternity_patients WHERE nicu_required=1`)).c;
    res.json({ stats, nicu_required:nicu, total:stats.reduce((s,x)=>s+x.count,0) });
  } catch(e) { next(e); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status, delivery_type, nicu_required } = req.body;
    const updates=[]; const vals=[];
    if (status        !== undefined) { updates.push('status=?');        vals.push(status);           }
    if (delivery_type !== undefined) { updates.push('delivery_type=?'); vals.push(delivery_type);    }
    if (nicu_required !== undefined) { updates.push('nicu_required=?'); vals.push(nicu_required?1:0); }
    if (status==='Delivered') { updates.push(`delivery_at=datetime('now')`); }
    if (!updates.length) return res.status(400).json({ error:'Nothing to update' });
    vals.push(req.params.id);
    await db.run(`UPDATE maternity_patients SET ${updates.join(',')} WHERE id=?`, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
