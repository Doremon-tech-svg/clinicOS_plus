require('dotenv').config();
const db = require('./index');
const { initSchema } = require('./schema');
const bcrypt = require('bcryptjs');

/**
 * Seeds 5 additional hospitals beyond the main Apex hospital.
 * Run after the main seed.js so staff/patient data stays intact.
 */
async function seedMoreHospitals() {
  await initSchema();

  const hash = await bcrypt.hash('password123', 10);

  const hospitals = [
    {
      name: 'Apollo Hospitals',
      address: 'Sarita Vihar, Mathura Road',
      city: 'New Delhi',
      phone: '+91-11-7179-1090',
      beds: 400,
      code: 'APOL2026',
      adminEmail: 'admin@apollo.com',
    },
    {
      name: 'Fortis Healthcare',
      address: 'Sector 62, Phase VIII',
      city: 'Mohali',
      phone: '+91-172-4692-222',
      beds: 350,
      code: 'FORT2026',
      adminEmail: 'admin@fortis.com',
    },
    {
      name: 'AIIMS New Delhi',
      address: 'Sri Aurobindo Marg, Ansari Nagar',
      city: 'New Delhi',
      phone: '+91-11-2659-3000',
      beds: 2478,
      code: 'AIIM2026',
      adminEmail: 'admin@aiims.com',
    },
    {
      name: 'Max Super Speciality',
      address: '2, Press Enclave Marg, Saket',
      city: 'New Delhi',
      phone: '+91-11-2651-5050',
      beds: 500,
      code: 'MAXS2026',
      adminEmail: 'admin@maxhospitals.com',
    },
    {
      name: 'Medanta The Medicity',
      address: 'CH Baktawar Singh Road, Sector 38',
      city: 'Gurugram',
      phone: '+91-124-414-1414',
      beds: 1250,
      code: 'MEDA2026',
      adminEmail: 'admin@medanta.com',
    },
    {
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      address: 'Rao Saheb Achutrao Patwardhan Marg',
      city: 'Mumbai',
      phone: '+91-22-4269-6969',
      beds: 750,
      code: 'KOKA2026',
      adminEmail: 'admin@kdah.com',
    },
    {
      name: 'CMC Vellore',
      address: 'Ida Scudder Road',
      city: 'Vellore',
      phone: '+91-416-228-1000',
      beds: 3000,
      code: 'CMCV2026',
      adminEmail: 'admin@cmcvellore.com',
    },
    {
      name: 'Safdarjung Hospital',
      address: 'Ring Road, Safdarjung',
      city: 'New Delhi',
      phone: '+91-11-2673-0000',
      beds: 1531,
      code: 'SAFD2026',
      adminEmail: 'admin@safdarjung.com',
    },
    {
      name: 'Narayana Health City',
      address: '258/A, Bommasandra Industrial Area',
      city: 'Bengaluru',
      phone: '+91-80-7122-2200',
      beds: 1000,
      code: 'NARA2026',
      adminEmail: 'admin@narayanahealth.com',
    },
    {
      name: 'Manipal Hospitals',
      address: '98, HAL Old Airport Road',
      city: 'Bengaluru',
      phone: '+91-80-2502-4444',
      beds: 600,
      code: 'MANI2026',
      adminEmail: 'admin@manipalhospitals.com',
    },
  ];

  let added = 0;
  for (const h of hospitals) {
    const exists = await db.get(`SELECT id FROM hospital WHERE access_code=?`, [h.code]);
    if (exists) {
      console.log(`⏭  Skipped: ${h.name} (already exists)`);
      continue;
    }

    const hRes = await db.run(
      `INSERT INTO hospital (name, address, city, phone, total_beds, access_code) VALUES (?, ?, ?, ?, ?, ?)`,
      [h.name, h.address, h.city, h.phone, h.beds, h.code]
    );
    const hId = hRes.lastInsertRowid;

    // Create admin staff profile
    const sRes = await db.run(
      `INSERT INTO staff (hospital_id, name, role, department) VALUES (?, 'Hospital Admin', 'admin', 'Administration')`,
      [hId]
    );

    // Create admin user — auto-approved
    await db.run(
      `INSERT INTO users (hospital_id, email, password_hash, role, profile_id, approval_status) VALUES (?, ?, ?, 'admin', ?, 'approved')`,
      [hId, h.adminEmail, hash, sRes.lastInsertRowid]
    );

    console.log(`✅ Added: ${h.name} (code: ${h.code})`);
    added++;

    // Seed realistic fleet for each hospital
    const fleetTemplates = [
      { unit_name: 'Unit Alpha-1', vehicle_reg: `${h.code.slice(0, 3)}-ALS-001`, vehicle_type: 'ALS', driver_name: 'Ramesh Kumar', driver_phone: '9811001001', status: 'Available' },
      { unit_name: 'Unit Bravo-2', vehicle_reg: `${h.code.slice(0, 3)}-BLS-002`, vehicle_type: 'BLS', driver_name: 'Suresh Yadav', driver_phone: '9811001002', status: 'Available' },
      { unit_name: 'Unit Charlie-3', vehicle_reg: `${h.code.slice(0, 3)}-ALS-003`, vehicle_type: 'ALS', driver_name: 'Mohan Tiwari', driver_phone: '9811001003', status: 'Busy' },
      { unit_name: 'Unit Delta-4', vehicle_reg: `${h.code.slice(0, 3)}-NIC-004`, vehicle_type: 'NICU', driver_name: 'Dinesh Patel', driver_phone: '9811001004', status: 'Available' },
      { unit_name: 'Unit Echo-5', vehicle_reg: `${h.code.slice(0, 3)}-BLS-005`, vehicle_type: 'BLS', driver_name: 'Vijay Singh', driver_phone: '9811001005', status: 'Maintenance' },
    ];
    for (const f of fleetTemplates) {
      const fExists = await db.get(`SELECT id FROM ambulances WHERE vehicle_reg=?`, [f.vehicle_reg]);
      if (!fExists) {
        await db.run(
          `INSERT INTO ambulances (hospital_id, unit_name, vehicle_reg, vehicle_type, status, driver_name, driver_phone) VALUES (?,?,?,?,?,?,?)`,
          [hId, f.unit_name, f.vehicle_reg, f.vehicle_type, f.status, f.driver_name, f.driver_phone]
        );
      }
    }
  }

  console.log(`\n🏥 Done. ${added} new hospitals added.`);
  setTimeout(() => process.exit(0), 300);
}

seedMoreHospitals().catch(e => { console.error('Error:', e.message); process.exit(1); });
