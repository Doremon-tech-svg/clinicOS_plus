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
    const { command, staff_id, patient_id, patient_name, bed, room, ward, department: patientDept, hospital_id = 1 } = req.body;
    if (!command?.trim()) return res.status(400).json({ error:'command required' });
    const lower   = command.toLowerCase();
    const matched = VOICE_MAP.find(v => lower.includes(v.keyword));
    const hash    = '0x'+crypto.createHash('md5').update(command+Date.now()).digest('hex').slice(0,16);

    // Get staff name for order attribution
    let staffName = 'Nurse';
    if (staff_id) {
      const s = await db.get(`SELECT name FROM staff WHERE id=?`, [staff_id]);
      if (s) staffName = s.name;
    }

    await db.run(`INSERT INTO voice_commands (staff_id,command,task,department,status,tx_hash) VALUES (?,?,?,?,?,?)`,
      [staff_id||null, command, matched?.action||'Unknown', matched?.dept||'Unknown', matched?'Completed':'Unrecognized', hash]);

    // ── Auto-create pharmacy order if voice command targets Pharmacy ──
    if (matched && matched.dept === 'Pharmacy') {
      // Extract medicine name from command (best-effort: strip common phrases)
      const medName = command.replace(/please|need|get|send|bring|give|patient|medicine|medication|iv|fluid|for|the|a|an|urgent|stat|urgently/gi,'').trim().replace(/\s+/g,' ') || matched.action;
      const priority = lower.includes('stat') || lower.includes('urgent') || lower.includes('immediately') ? 'Stat' : 'Routine';
      await db.run(
        `INSERT INTO pharmacy_orders (hospital_id,patient_id,patient_name,bed,room,ward,department,medicine_name,quantity,unit,priority,ordered_by,ordered_by_name,source,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [hospital_id, patient_id||null, patient_name||'', bed||'', room||'', ward||'', patientDept||'', medName, 1, 'units', priority, staff_id||null, staffName, 'voice', `Voice command: "${command}"`]
      );
      await notif.create({ type:'pharmacy', title:`${matched.icon} ${matched.action}`, message:`"${command}" — ${patient_name||'Patient'}${bed ? ` · Bed ${bed}` : ''}`, department:'Pharmacy', target_role:'pharmacist' });
    } else if (matched) {
      await notif.create({ type:'task', title:`${matched.icon} ${matched.action}`, message:`Voice: "${command}"`, department:matched.dept, target_role:'nurse' });
    }

    res.json({ success:!!matched, action:matched?.action||'Command not recognized', department:matched?.dept||null, hash, icon:matched?.icon||'❓' });
  } catch(e) { next(e); }
});

router.get('/logs', async (req, res, next) => {
  try {
    res.json({ logs: await db.all(`SELECT vc.*, s.name as staff_name FROM voice_commands vc LEFT JOIN staff s ON vc.staff_id=s.id ORDER BY vc.created_at DESC LIMIT 30`) });
  } catch(e) { next(e); }
});

module.exports = router;
