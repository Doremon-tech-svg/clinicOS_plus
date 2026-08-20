const router = require('express').Router();
const db     = require('../db/index');

router.get('/', async (req, res, next) => {
  try {
    const { role, department, availability } = req.query;
    let sql=`SELECT * FROM staff WHERE 1=1`; const params=[];
    if (role)         { sql+=` AND role=?`;         params.push(role);         }
    if (department)   { sql+=` AND department=?`;   params.push(department);   }
    if (availability) { sql+=` AND availability=?`; params.push(availability); }
    sql+=` ORDER BY department, name`;
    res.json({ staff: await db.all(sql, params) });
  } catch(e) { next(e); }
});

router.get('/hospital/info', async (req, res, next) => {
  try { res.json(await db.get(`SELECT * FROM hospital LIMIT 1`)); } catch(e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const s = await db.get(`SELECT * FROM staff WHERE id=?`, [req.params.id]);
    if (!s) return res.status(404).json({ error:'Staff not found' });
    res.json(s);
  } catch(e) { next(e); }
});

router.patch('/:id/availability', async (req, res, next) => {
  try {
    await db.run(`UPDATE staff SET availability=? WHERE id=?`, [req.body.availability, req.params.id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

module.exports = router;
