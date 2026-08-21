require('dotenv').config();
const db = require('./index');
const { initSchema } = require('./schema');

async function seedBeds() {
  await initSchema();

  const hospitals = await db.all(`SELECT id FROM hospital`);
  if (!hospitals.length) { console.log('⚠️ No hospitals found. Run main seed first.'); process.exit(1); }

  let wardsAdded = 0, roomsAdded = 0, bedsAdded = 0;

  for (const h of hospitals) {
    // Define Wards (including new big wards)
    const wards = [
      { name: 'Ward A', type: 'General', rooms: 4, bedsPerRoom: 5 },
      { name: 'Ward B', type: 'Surgical', rooms: 4, bedsPerRoom: 4 },
      { name: 'Ward C', type: 'ICU', rooms: 8, bedsPerRoom: 1 },
      { name: 'Maternity Ward', type: 'Maternity', rooms: 5, bedsPerRoom: 3 },
      { name: 'Cardiology (Big Ward)', type: 'Cardiology', rooms: 10, bedsPerRoom: 6 },
      { name: 'Neurology (Big Ward)', type: 'Neurology', rooms: 8, bedsPerRoom: 5 },
      { name: 'Pediatrics', type: 'Pediatrics', rooms: 6, bedsPerRoom: 4 },
      { name: 'Oncology', type: 'Oncology', rooms: 12, bedsPerRoom: 2 }
    ];

    for (const w of wards) {
      // Check if this specific ward already exists
      const existingWard = await db.get(`SELECT id FROM wards WHERE hospital_id=? AND name=?`, [h.id, w.name]);
      if (existingWard) continue;

      const capacity = w.rooms * w.bedsPerRoom;
      const wRes = await db.run(`INSERT INTO wards (hospital_id, name, type, capacity) VALUES (?, ?, ?, ?)`, [h.id, w.name, w.type, capacity]);
      
      const insertedWard = await db.get(`SELECT id FROM wards WHERE hospital_id=? AND name=? ORDER BY id DESC LIMIT 1`, [h.id, w.name]);
      const wId = insertedWard.id;
      wardsAdded++;

      // Create Rooms for the Ward
      for (let r = 1; r <= w.rooms; r++) {
        const roomPrefix = w.name.split(' ')[0].substring(0, 3).toUpperCase();
        const roomNum = `${roomPrefix}-${r}`;
        const roomType = w.bedsPerRoom === 1 ? 'Private' : 'Shared';
        
        await db.run(`INSERT INTO rooms (hospital_id, ward_id, room_number, type) VALUES (?, ?, ?, ?)`, [h.id, wId, roomNum, roomType]);
        const insertedRoom = await db.get(`SELECT id FROM rooms WHERE hospital_id=? AND ward_id=? AND room_number=? ORDER BY id DESC LIMIT 1`, [h.id, wId, roomNum]);
        const rId = insertedRoom.id;
        roomsAdded++;

        // Create Beds for the Room
        for (let b = 1; b <= w.bedsPerRoom; b++) {
          const bedNum = `${roomNum}-B${b}`;
          await db.run(`INSERT INTO beds (hospital_id, ward_id, room_id, bed_number, status) VALUES (?, ?, ?, ?, 'Available')`, [h.id, wId, rId, bedNum]);
          bedsAdded++;
        }
      }
    }
  }

  // Update existing patients to link to beds if possible
  const patients = await db.all(`SELECT id, hospital_id, bed FROM patients WHERE status='Admitted'`);
  for (const p of patients) {
    if (p.bed) {
      // Find a matching bed by bed_number or just grab any available bed in that hospital
      let bed = await db.get(`SELECT id, room_id, ward_id FROM beds WHERE hospital_id=? AND bed_number LIKE ? AND status='Available' LIMIT 1`, [p.hospital_id, `%${p.bed}%`]);
      if (!bed) bed = await db.get(`SELECT id, room_id, ward_id FROM beds WHERE hospital_id=? AND status='Available' LIMIT 1`, [p.hospital_id]);
      
      if (bed) {
        // Mark bed as occupied
        await db.run(`UPDATE beds SET status='Occupied', patient_id=? WHERE id=?`, [p.id, bed.id]);
        
        // Update patient to match the bed's exact names for consistency (room/ward)
        const room = await db.get(`SELECT room_number FROM rooms WHERE id=?`, [bed.room_id]);
        const ward = await db.get(`SELECT name FROM wards WHERE id=?`, [bed.ward_id]);
        
        if (room && ward) {
          await db.run(`UPDATE patients SET room=?, ward=? WHERE id=?`, [room.room_number, ward.name, p.id]);
        }
      }
    }
  }

  console.log(`🛏️ Beds seeded: ${wardsAdded} Wards, ${roomsAdded} Rooms, ${bedsAdded} Beds added.`);
  setTimeout(() => process.exit(0), 300);
}

seedBeds().catch(e => { console.error('Beds seed failed:', e.message); process.exit(1); });
