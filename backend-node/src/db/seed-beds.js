require('dotenv').config();
const db = require('./index');
const { initSchema } = require('./schema');

async function seedBeds() {
  await initSchema();

  const hospitals = await db.all(`SELECT id FROM hospital`);
  if (!hospitals.length) { console.log('⚠️ No hospitals found. Run main seed first.'); process.exit(1); }

  let wardsAdded = 0, roomsAdded = 0, bedsAdded = 0;

  for (const h of hospitals) {
    // Check if wards already exist for this hospital
    const existing = await db.get(`SELECT COUNT(*) as c FROM wards WHERE hospital_id=?`, [h.id]);
    if (existing && existing.c > 0) continue;

    // Define Wards
    const wards = [
      { name: 'Ward A', type: 'General', capacity: 20 },
      { name: 'Ward B', type: 'Surgical', capacity: 15 },
      { name: 'Ward C', type: 'ICU', capacity: 10 },
      { name: 'Maternity Ward', type: 'Maternity', capacity: 15 }
    ];

    for (const w of wards) {
      const wRes = await db.run(`INSERT INTO wards (hospital_id, name, type, capacity) VALUES (?, ?, ?, ?)`, [h.id, w.name, w.type, w.capacity]);
      const wardId = wRes.lastInsertRowid || wRes.id; // SQLite vs Postgres handling (Postgres uses RETURNING, but this is a mock. Actually, we need to handle Postgres correctly if it's Supabase)
      
      // Let's get the ward ID safely
      const insertedWard = await db.get(`SELECT id FROM wards WHERE hospital_id=? AND name=? ORDER BY id DESC LIMIT 1`, [h.id, w.name]);
      const wId = insertedWard.id;
      wardsAdded++;

      // Create Rooms for the Ward
      const numRooms = w.type === 'ICU' ? 5 : 4;
      for (let r = 1; r <= numRooms; r++) {
        const roomNum = `${w.name.split(' ')[1] || 'M'}-${r}`;
        const roomType = w.type === 'ICU' ? 'Private' : 'Shared';
        
        await db.run(`INSERT INTO rooms (hospital_id, ward_id, room_number, type) VALUES (?, ?, ?, ?)`, [h.id, wId, roomNum, roomType]);
        const insertedRoom = await db.get(`SELECT id FROM rooms WHERE hospital_id=? AND ward_id=? AND room_number=? ORDER BY id DESC LIMIT 1`, [h.id, wId, roomNum]);
        const rId = insertedRoom.id;
        roomsAdded++;

        // Create Beds for the Room
        const numBeds = roomType === 'Private' ? 1 : 4;
        for (let b = 1; b <= numBeds; b++) {
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
