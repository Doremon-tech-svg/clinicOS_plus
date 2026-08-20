const router = require('express').Router();
const db     = require('../db/index');
const crypto = require('crypto');
const notif  = require('../services/notificationService');

const VOICE_MAP = [
  { keyword:'wheelchair',    dept:'Housekeeping', icon:'♿', action:'Wheelchair dispatched'                },
  { keyword:'crash cart',    dept:'Emergency',    icon:'🚨', action:'Crash cart alert sent'                },
  { keyword:'discharge',     dept:'Admin',        icon:'🚪', action:'Discharge workflow initiated'          },
  { keyword:'iv fluid',      dept:'Pharmacy',     icon:'💉', action:'IV fluid request sent'                 },
  { keyword:'medication',    dept:'Pharmacy',     icon:'💊', action:'Medication request queued'             },
  { keyword:'clean',         dept:'Housekeeping', icon:'🧹', action:'Room cleaning requested'               },
  { keyword:'oxygen',        dept:'Respiratory',  icon:'🫁', action:'Oxygen support team notified'          },
  { keyword:'blood pressure',dept:'Nursing',      icon:'🩺', action:'BP monitoring task created'            },
  { keyword:'fall',          dept:'Nursing',      icon:'⚠️', action:'Fall prevention protocol triggered'    },
  { keyword:'code blue',     dept:'Emergency',    icon:'💙', action:'CODE BLUE — Resuscitation team alerted'},
];

router.post('/command', async (req, res, next) => {
  try {
    const { command, staff_id } = req.body;
    if (!command?.trim()) return res.status(400).json({ error:'command required' });
    const lower   = command.toLowerCase();
    const matched = VOICE_MAP.find(v => lower.includes(v.keyword));
    const hash    = '0x'+crypto.createHash('md5').update(command+Date.now()).digest('hex').slice(0,16);
    await db.run(`INSERT INTO voice_commands (staff_id,command,task,department,status,tx_hash) VALUES (?,?,?,?,?,?)`,
      [staff_id||null, command, matched?.action||'Unknown', matched?.dept||'Unknown', matched?'Completed':'Unrecognized', hash]);
    if (matched) await notif.create({ type:'task', title:`${matched.icon} ${matched.action}`, message:`Voice: "${command}"`, department:matched.dept, target_role:'nurse' });
    res.json({ success:!!matched, action:matched?.action||'Command not recognized', department:matched?.dept||null, hash, icon:matched?.icon||'❓' });
  } catch(e) { next(e); }
});

router.get('/logs', async (req, res, next) => {
  try {
    res.json({ logs: await db.all(`SELECT vc.*, s.name as staff_name FROM voice_commands vc LEFT JOIN staff s ON vc.staff_id=s.id ORDER BY vc.created_at DESC LIMIT 30`) });
  } catch(e) { next(e); }
});

module.exports = router;
