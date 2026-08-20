const router = require('express').Router();
const db     = require('../db/index');
const crypto = require('crypto');

router.get('/events', async (req, res, next) => {
  try { res.json({ events: await db.all(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50`) }); } catch(e) { next(e); }
});

router.get('/ai-audit', async (req, res, next) => {
  try { res.json({ records: await db.all(`SELECT * FROM ai_audit_trail ORDER BY created_at DESC LIMIT 100`) }); } catch(e) { next(e); }
});

router.post('/consent', async (req, res, next) => {
  try {
    const { patient_mrn, department, granted } = req.body;
    const tx = '0x'+crypto.randomBytes(20).toString('hex');
    await db.run(`INSERT INTO consents (patient_mrn,department,granted,tx_hash) VALUES (?,?,?,?)`, [patient_mrn, department, granted?1:0, tx]);
    await db.run(`INSERT INTO audit_logs (action,patient_name,details,tx_hash) VALUES (?,?,?,?)`, ['ConsentRecorded', patient_mrn, `Dept:${department}|Granted:${granted}`, tx]);
    res.json({ success:true, tx_hash:tx });
  } catch(e) { next(e); }
});

module.exports = router;
