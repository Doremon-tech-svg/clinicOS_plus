const db = require('./index');

async function initSchema() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS hospital (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, address TEXT, city TEXT, phone TEXT, total_beds INTEGER DEFAULT 250, access_code TEXT UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_id INTEGER, email TEXT UNIQUE, password_hash TEXT, role TEXT, profile_id INTEGER, 
      approval_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_id INTEGER DEFAULT 1, name TEXT NOT NULL, role TEXT NOT NULL,
      department TEXT, specialization TEXT, experience_yrs INTEGER DEFAULT 0, phone TEXT, email TEXT,
      availability TEXT DEFAULT 'Available', shift TEXT DEFAULT 'Day', avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ambulances (
      id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_id INTEGER DEFAULT 1, unit_name TEXT NOT NULL,
      vehicle_reg TEXT, vehicle_type TEXT DEFAULT 'ALS', status TEXT DEFAULT 'Available',
      driver_name TEXT, driver_phone TEXT, paramedic_id INTEGER,
      current_alert_id INTEGER, last_lat REAL, last_lng REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_id INTEGER DEFAULT 1, name TEXT NOT NULL, mrn TEXT UNIQUE NOT NULL,
      age INTEGER, gender TEXT, blood_group TEXT, phone TEXT, address TEXT,
      ward TEXT, bed TEXT, room TEXT, department TEXT, diagnosis TEXT,
      risk_score REAL DEFAULT 0, risk_label TEXT DEFAULT 'Low',
      hr INTEGER, bp TEXT, spo2 REAL, temp REAL,
      admitted_at DATETIME DEFAULT CURRENT_TIMESTAMP, discharged_at DATETIME,
      status TEXT DEFAULT 'Admitted', attending_doctor_id INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS emergency_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, paramedic_id INTEGER, ambulance_id INTEGER, ambulance_unit TEXT,
      raw_input TEXT, condition_summary TEXT, severity TEXT DEFAULT 'Moderate',
      departments TEXT, preparation TEXT, clinical_note TEXT, eta_minutes INTEGER,
      dispatched_location TEXT, gps_lat REAL, gps_lng REAL, status TEXT DEFAULT 'Dispatched',
      assigned_doctor_id INTEGER, assigned_paramedic_id INTEGER, assigned_nurses TEXT,
      blockchain_tx TEXT, ai_confidence INTEGER,
      dispatched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at DATETIME, arrived_at DATETIME, completed_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS lab_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, patient_name TEXT,
      patient_room TEXT, ordered_by INTEGER, test_name TEXT NOT NULL, test_type TEXT,
      status TEXT DEFAULT 'Pending', result TEXT, flagged INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Normal', ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP, completed_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS surgeries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, patient_name TEXT,
      surgeon_id INTEGER, surgeon_name TEXT, ot_room TEXT, procedure TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled', priority TEXT DEFAULT 'Elective',
      eta_mins INTEGER, scheduled_at DATETIME, started_at DATETIME, ended_at DATETIME, notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS opd_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE, patient_name TEXT NOT NULL,
      age INTEGER, department TEXT, doctor_id INTEGER, wait_mins INTEGER DEFAULT 0,
      ai_priority TEXT DEFAULT 'Normal', status TEXT DEFAULT 'Waiting',
      checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP, seen_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS maternity_patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, patient_name TEXT NOT NULL,
      age INTEGER, room TEXT, gestation_weeks INTEGER, doctor_id INTEGER, doctor_name TEXT,
      status TEXT DEFAULT 'Admitted', delivery_type TEXT, nicu_required INTEGER DEFAULT 0,
      admitted_at DATETIME DEFAULT CURRENT_TIMESTAMP, delivery_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS radiology_scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, patient_name TEXT,
      patient_room TEXT, scan_type TEXT, body_part TEXT, ordered_by INTEGER,
      radiologist_id INTEGER, status TEXT DEFAULT 'Scheduled', report TEXT,
      priority TEXT DEFAULT 'Routine', scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP, reported_at DATETIME
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT DEFAULT 'info',
      title TEXT NOT NULL, message TEXT, department TEXT, target_role TEXT,
      target_user_id INTEGER, read INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ai_audit_trail (
      id INTEGER PRIMARY KEY AUTOINCREMENT, decision_type TEXT, input_text TEXT,
      ai_output TEXT, confidence INTEGER, model_used TEXT, blockchain_tx TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS voice_commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT, staff_id INTEGER, command TEXT NOT NULL,
      task TEXT, department TEXT, status TEXT DEFAULT 'Pending', tx_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, patient_mrn TEXT NOT NULL, department TEXT NOT NULL,
      granted INTEGER DEFAULT 0, tx_hash TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT NOT NULL, patient_name TEXT,
      details TEXT, tx_hash TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (let sql of tables) {
    if (db.IS_POSTGRES) {
      sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY');
      sql = sql.replace(/INTEGER PRIMARY KEY/g, 'SERIAL PRIMARY KEY');
      sql = sql.replace(/DATETIME/g, 'TIMESTAMP');
      sql = sql.replace(/REAL/g, 'DECIMAL');
    }
    await db.run(sql);
  }

  // Seed fleet data if empty
  const fleetCount = await db.get('SELECT COUNT(*) as cnt FROM ambulances');
  if (!fleetCount || fleetCount.cnt === 0) {
    const units = [
      [1, 'Unit 1-Alpha',  'DL-01-AM-0001', 'ALS', 'Available',    'Ramesh Kumar',    '+91-98100-11001', null],
      [1, 'Unit 2-Bravo',  'DL-01-AM-0002', 'ALS', 'Available',    'Suresh Yadav',    '+91-98100-11002', null],
      [1, 'Unit 3-Charlie','DL-01-AM-0003', 'BLS', 'Available',    'Mahesh Singh',    '+91-98100-11003', null],
      [1, 'Unit 4-Delta',  'DL-01-AM-0004', 'ALS', 'Busy',         'Pradeep Tiwari',  '+91-98100-11004', null],
      [1, 'Unit 5-Echo',   'DL-01-AM-0005', 'BLS', 'Busy',         'Ajay Sharma',     '+91-98100-11005', null],
      [1, 'Unit 6-Foxtrot','DL-01-AM-0006', 'ALS', 'Available',    'Vikram Gupta',    '+91-98100-11006', null],
      [1, 'Unit 7-Golf',   'DL-01-AM-0007', 'NICU','Maintenance',  'Deepak Verma',    '+91-98100-11007', null],
      [1, 'Unit 8-Hotel',  'DL-01-AM-0008', 'BLS', 'Available',    'Rohit Mishra',    '+91-98100-11008', null],
    ];
    for (const u of units) {
      await db.run(
        `INSERT INTO ambulances (hospital_id,unit_name,vehicle_reg,vehicle_type,status,driver_name,driver_phone,paramedic_id) VALUES (?,?,?,?,?,?,?,?)`,
        u
      );
    }
    console.log('🚑 Fleet seed data inserted');
  }

  console.log('✅ Schema ready');
}

module.exports = { initSchema };
