const router = require('express').Router();
const db = require('../db/index');

// ─── Emergency Seeder Route ─────────────────────────────────────────────
router.get('/force-seed', async (req, res, next) => {
  try {
    const { execSync } = require('child_process');
    const result = execSync('node src/db/seed-pharmacy.js', { encoding: 'utf-8' });
    res.json({ success: true, logs: result });
  } catch(e) {
    res.status(500).json({ error: e.message, stderr: e.stderr ? e.stderr.toString() : '', stdout: e.stdout ? e.stdout.toString() : '' });
  }
});

// ─── Stock ────────────────────────────────────────────────────────────────────

// GET /api/pharmacy/stock
router.get('/stock', async (req, res, next) => {
  try {
    const { hospital_id = 1, q } = req.query;
    let sql = `SELECT * FROM pharmacy_stock WHERE hospital_id=?`;
    const vals = [hospital_id];
    if (q) { sql += ` AND (name LIKE ? OR generic_name LIKE ? OR category LIKE ?)`; const p = `%${q}%`; vals.push(p,p,p); }
    sql += ` ORDER BY CASE WHEN quantity <= reorder_level THEN 0 ELSE 1 END, name`;
    const stock = await db.all(sql, vals);
    const low = stock.filter(s => s.quantity <= s.reorder_level).length;
    res.json({ stock, low_stock_count: low });
  } catch(e) { next(e); }
});

// POST /api/pharmacy/stock — add new medicine
router.post('/stock', async (req, res, next) => {
  try {
    const { hospital_id=1, name, generic_name, category, unit, quantity, reorder_level, location, price_per_unit } = req.body;
    if (!name) return res.status(400).json({ error:'name required' });
    const r = await db.run(
      `INSERT INTO pharmacy_stock (hospital_id,name,generic_name,category,unit,quantity,reorder_level,location,price_per_unit) VALUES (?,?,?,?,?,?,?,?,?)`,
      [hospital_id, name, generic_name||'', category||'General', unit||'tablets', quantity||0, reorder_level||50, location||'', price_per_unit||0]
    );
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

// PATCH /api/pharmacy/stock/:id — update quantity
router.patch('/stock/:id', async (req, res, next) => {
  try {
    const { quantity, location, reorder_level } = req.body;
    const fields=[]; const vals=[];
    if (quantity !== undefined)       { fields.push('quantity=?');       vals.push(quantity); }
    if (location !== undefined)       { fields.push('location=?');       vals.push(location); }
    if (reorder_level !== undefined)  { fields.push('reorder_level=?');  vals.push(reorder_level); }
    if (!fields.length) return res.status(400).json({ error:'nothing to update' });
    fields.push('updated_at=CURRENT_TIMESTAMP');
    vals.push(req.params.id);
    await db.run(`UPDATE pharmacy_stock SET ${fields.join(',')} WHERE id=?`, vals);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// DELETE /api/pharmacy/stock/:id
router.delete('/stock/:id', async (req, res, next) => {
  try {
    await db.run(`DELETE FROM pharmacy_stock WHERE id=?`, [req.params.id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// ─── Orders ───────────────────────────────────────────────────────────────────

// GET /api/pharmacy/orders
router.get('/orders', async (req, res, next) => {
  try {
    const { hospital_id=1, status, priority, source } = req.query;
    let sql = `SELECT po.*, p.department as patient_dept, p.diagnosis 
               FROM pharmacy_orders po 
               LEFT JOIN patients p ON po.patient_id=p.id
               WHERE po.hospital_id=?`;
    const vals = [hospital_id];
    if (status)   { sql += ` AND po.status=?`;   vals.push(status); }
    if (priority) { sql += ` AND po.priority=?`; vals.push(priority); }
    if (source)   { sql += ` AND po.source=?`;   vals.push(source); }
    sql += ` ORDER BY CASE po.priority WHEN 'Stat' THEN 0 WHEN 'Urgent' THEN 1 ELSE 2 END, po.created_at DESC LIMIT 50`;
    const orders = await db.all(sql, vals);
    res.json({ orders });
  } catch(e) { next(e); }
});

// POST /api/pharmacy/orders — create order (manual or from voice)
router.post('/orders', async (req, res, next) => {
  try {
    const { hospital_id=1, patient_id, patient_name, bed, room, ward, department,
            medicine_name, quantity=1, unit='tablets', priority='Routine',
            ordered_by, ordered_by_name, source='manual', notes } = req.body;
    if (!medicine_name) return res.status(400).json({ error:'medicine_name required' });
    const r = await db.run(
      `INSERT INTO pharmacy_orders (hospital_id,patient_id,patient_name,bed,room,ward,department,medicine_name,quantity,unit,priority,ordered_by,ordered_by_name,source,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [hospital_id, patient_id||null, patient_name||'', bed||'', room||'', ward||'', department||'', medicine_name, quantity, unit, priority, ordered_by||null, ordered_by_name||'Nurse', source, notes||'']
    );
    res.json({ success:true, id:r.lastInsertRowid });
  } catch(e) { next(e); }
});

// PATCH /api/pharmacy/orders/:id/dispense
router.patch('/orders/:id/dispense', async (req, res, next) => {
  try {
    const { dispensed_by } = req.body;
    await db.run(
      `UPDATE pharmacy_orders SET status='Dispensed', dispensed_by=?, dispensed_at=CURRENT_TIMESTAMP WHERE id=?`,
      [dispensed_by||null, req.params.id]
    );
    // Deduct stock if medicine matches
    const order = await db.get(`SELECT * FROM pharmacy_orders WHERE id=?`, [req.params.id]);
    if (order) {
      await db.run(
        `UPDATE pharmacy_stock SET quantity=MAX(0, quantity-?), updated_at=CURRENT_TIMESTAMP WHERE hospital_id=? AND name LIKE ?`,
        [order.quantity, order.hospital_id, `%${order.medicine_name}%`]
      );
    }
    res.json({ success:true });
  } catch(e) { next(e); }
});

// PATCH /api/pharmacy/orders/:id/reject
router.patch('/orders/:id/reject', async (req, res, next) => {
  try {
    await db.run(`UPDATE pharmacy_orders SET status='Rejected' WHERE id=?`, [req.params.id]);
    res.json({ success:true });
  } catch(e) { next(e); }
});

// GET /api/pharmacy/stats
router.get('/stats', async (req, res, next) => {
  try {
    const { hospital_id=1 } = req.query;
    const [pending, stat_orders, dispensed_today, low_stock] = await Promise.all([
      db.get(`SELECT COUNT(*) as c FROM pharmacy_orders WHERE hospital_id=? AND status='Pending'`, [hospital_id]),
      db.get(`SELECT COUNT(*) as c FROM pharmacy_orders WHERE hospital_id=? AND priority='Stat' AND status='Pending'`, [hospital_id]),
      db.get(`SELECT COUNT(*) as c FROM pharmacy_orders WHERE hospital_id=? AND status='Dispensed' AND DATE(dispensed_at)=DATE(CURRENT_TIMESTAMP)`, [hospital_id]),
      db.get(`SELECT COUNT(*) as c FROM pharmacy_stock WHERE hospital_id=? AND quantity <= reorder_level`, [hospital_id]),
    ]);
    res.json({
      pending:        Number(pending?.c    || 0),
      stat_orders:    Number(stat_orders?.c || 0),
      dispensed_today:Number(dispensed_today?.c || 0),
      low_stock:      Number(low_stock?.c   || 0),
    });
  } catch(e) { next(e); }
});

module.exports = router;
