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
    const lower = command.toLowerCase();
    
    // AI Parsing in Backend using Groq
    let aiResult = { recognized: false };
    const groqKey = process.env.GROQ_KEY_1 || process.env.GROQ_KEY_2;
    if (groqKey) {
      try {
        const aiResponse = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [{
              role: "system",
              content: `You are a hospital assistant AI. Parse this command: "${command}".
Return JSON ONLY:
{
  "department": "Pharmacy, Emergency, Cleaning, Respiratory, Cardiology, Surgery, Laboratory, Medical, Nurse, Admin",
  "action": "brief action description",
  "urgency": "STAT | High | Medium | Low",
  "icon": "emoji",
  "recognized": true
}
If totally irrelevant, return {"recognized": false}.`
            }],
            temperature: 0.1,
            max_tokens: 200,
            response_format: { type: "json_object" }
          })
        });
        const data = await aiResponse.json();
        if (!aiResponse.ok) {
          console.error("Groq API Error in command:", data);
          aiResult = { recognized: false, error: data.error?.message };
        } else {
          let raw = data.choices?.[0]?.message?.content || "";
          raw = raw.replace(/```json|```/gi, "").trim();
          aiResult = JSON.parse(raw);
        }
      } catch (err) {
        console.error("Backend Groq parsing failed", err);
      }
    }

    const matched = aiResult.recognized ? 
      { dept: aiResult.department, action: aiResult.action, icon: aiResult.icon } : 
      VOICE_MAP.find(v => lower.includes(v.keyword));
      
    const hash = '0x'+crypto.createHash('md5').update(command+Date.now()).digest('hex').slice(0,16);

    let staffName = 'Nurse';
    if (staff_id) {
      const s = await db.get(`SELECT name FROM staff WHERE id=?`, [staff_id]);
      if (s) staffName = s.name;
    }

    await db.run(`INSERT INTO voice_commands (staff_id,command,task,department,status,tx_hash) VALUES (?,?,?,?,?,?)`,
      [staff_id||null, command, matched?.action||'Unknown', matched?.dept||'Unknown', matched?'Completed':'Unrecognized', hash]);

    if (matched && matched.dept === 'Pharmacy') {
      const medName = command.replace(/please|need|get|send|bring|give|patient|medicine|medication|iv|fluid|for|the|a|an|urgent|stat|urgently/gi,'').trim().replace(/\s+/g,' ') || matched.action;
      const priority = (aiResult && aiResult.urgency === 'STAT') || lower.includes('stat') || lower.includes('urgent') ? 'Stat' : 'Routine';
      await db.run(
        `INSERT INTO pharmacy_orders (hospital_id,patient_id,patient_name,bed,room,ward,department,medicine_name,quantity,unit,priority,ordered_by,ordered_by_name,source,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [hospital_id, patient_id||null, patient_name||'', bed||'', room||'', ward||'', patientDept||'', medName, 1, 'units', priority, staff_id||null, staffName, 'voice', `Voice command: "${command}"`]
      );
      await notif.create({ type:'pharmacy', title:`${matched.icon} ${matched.action}`, message:`"${command}" — ${patient_name||'Patient'}${bed ? ` · Bed ${bed}` : ''}`, department:'Pharmacy', target_role:'pharmacist' });
    } else if (matched && matched.dept === 'Surgery') {
      await notif.create({ type:'surgery', title:`${matched.icon} ${matched.action}`, message:`Voice: "${command}"`, department:'Surgery', target_role:'surgeon' });
    } else if (matched) {
      await notif.create({ type:'task', title:`${matched.icon} ${matched.action}`, message:`Voice: "${command}"`, department:matched.dept, target_role:'nurse' });
    }

    res.json({ success:!!matched, action:matched?.action||'Command not recognized', department:matched?.dept||null, hash, icon:matched?.icon||'❓', isAI: aiResult.recognized });
  } catch(e) { next(e); }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'text required' });

    const groqKey = process.env.GROQ_KEY_1 || process.env.GROQ_KEY_2;
    if (!groqKey) {
      return res.json({ reply: "API Key not configured on the backend server." });
    }

    const aiResponse = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{
          role: "system",
          content: "You are a friendly, concise hospital assistant. Keep replies brief."
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    
    const data = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("Groq API Error in chat:", data);
      return res.json({ reply: `AI Error: ${data.error?.message || 'Unknown error from Groq'}` });
    }
    const reply = data.choices?.[0]?.message?.content || "I didn't understand.";
    res.json({ reply });
  } catch (err) {
    console.error("Backend chat failed", err);
    res.json({ reply: "Connection to AI failed." });
  }
});

router.post('/report', async (req, res, next) => {
  try {
    const { patient } = req.body;
    if (!patient) return res.status(400).json({ error: 'patient required' });

    const groqKey = process.env.GROQ_KEY_1 || process.env.GROQ_KEY_2;
    if (!groqKey) {
      return res.json({ report: "API Key not configured on the backend server." });
    }

    const aiResponse = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{
          role: "system",
          content: "You are a clinical AI. Provide a discharge timeline prediction report based on the clinical data provided. Keep it under 50 words and professional."
        }, {
          role: "user",
          content: `Patient: ${patient.name}, Age: ${patient.age}, Diagnosis: ${patient.diagnosis}. Vitals: HR ${patient.hr}, BP ${patient.bp}, SpO2 ${patient.spo2}%. Fall risk score: ${patient.risk}%.`
        }],
        temperature: 0.4
      })
    });
    
    const data = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("Groq API Error in report:", data);
      return res.json({ report: `AI Error: ${data.error?.message || 'Unknown error from Groq'}` });
    }
    const report = data.choices?.[0]?.message?.content || "Error generating report.";
    res.json({ report });
  } catch (err) {
    console.error("Backend report generation failed", err);
    res.json({ report: "Error generating report from backend." });
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    res.json({ logs: await db.all(`SELECT vc.*, s.name as staff_name FROM voice_commands vc LEFT JOIN staff s ON vc.staff_id=s.id ORDER BY vc.created_at DESC LIMIT 30`) });
  } catch(e) { next(e); }
});

// ─── Nursing Data Routes ─────────────────────────────────────────────

router.get('/patients', async (req, res, next) => {
  try {
    const { hospital_id = 1, ward } = req.query;
    let sql = `SELECT * FROM patients WHERE hospital_id=? AND status='Admitted'`;
    const params = [hospital_id];
    if (ward) { sql += ` AND ward=?`; params.push(ward); }
    const patients = await db.all(sql, params);
    res.json({ patients });
  } catch(e) { next(e); }
});

router.get('/wards', async (req, res, next) => {
  try {
    const { hospital_id = 1 } = req.query;
    const wards = await db.all(`SELECT * FROM wards WHERE hospital_id=?`, [hospital_id]);
    const rooms = await db.all(`SELECT * FROM rooms WHERE hospital_id=?`, [hospital_id]);
    const beds = await db.all(`
      SELECT b.*, p.name as patient_name, p.mrn, p.age, p.gender, p.diagnosis, p.risk_label,
             r.room_number as room, w.name as ward, b.bed_number as bed
      FROM beds b 
      LEFT JOIN patients p ON b.patient_id=p.id 
      LEFT JOIN rooms r ON b.room_id=r.id
      LEFT JOIN wards w ON b.ward_id=w.id
      WHERE b.hospital_id=?
    `, [hospital_id]);
    
    // Nest beds inside rooms inside wards
    const tree = wards.map(w => {
      const wRooms = rooms.filter(r => r.ward_id === w.id).map(r => ({
        ...r,
        beds: beds.filter(b => b.room_id === r.id)
      }));
      return { ...w, rooms: wRooms };
    });
    
    res.json({ wards: tree, rawBeds: beds });
  } catch(e) { next(e); }
});

router.patch('/patients/:id', async (req, res, next) => {
  try {
    const { hr, bp, spo2, temp, glucose, bed_id } = req.body;
    const pId = req.params.id;
    
    const updates = []; const params = [];
    if (hr !== undefined) { updates.push('hr=?'); params.push(hr); }
    if (bp !== undefined) { updates.push('bp=?'); params.push(bp); }
    if (spo2 !== undefined) { updates.push('spo2=?'); params.push(spo2); }
    if (temp !== undefined) { updates.push('temp=?'); params.push(temp); }
    if (glucose !== undefined) { updates.push('glucose=?'); params.push(glucose); }
    
    if (bed_id) {
      // Free old bed
      await db.run(`UPDATE beds SET status='Available', patient_id=NULL WHERE patient_id=?`, [pId]);
      // Occupy new bed
      await db.run(`UPDATE beds SET status='Occupied', patient_id=? WHERE id=?`, [pId, bed_id]);
      
      const bInfo = await db.get(`SELECT b.bed_number, r.room_number, w.name as ward_name FROM beds b JOIN rooms r ON b.room_id=r.id JOIN wards w ON b.ward_id=w.id WHERE b.id=?`, [bed_id]);
      if (bInfo) {
        updates.push('bed=?', 'room=?', 'ward=?');
        params.push(bInfo.bed_number, bInfo.room_number, bInfo.ward_name);
      }
    }
    
    if (updates.length > 0) {
      params.push(pId);
      await db.run(`UPDATE patients SET ${updates.join(', ')} WHERE id=?`, params);
    }
    
    res.json({ success: true });
  } catch(e) { next(e); }
});

module.exports = router;
