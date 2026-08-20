require('dotenv').config();
const db = require('./index');
const { initSchema } = require('./schema');

async function seed() {
  await initSchema();

  // Clear
  const clears = ['radiology_scans','maternity_patients','opd_queue','surgeries','lab_tests',
    'emergency_alerts','ambulances','patients','staff','hospital','notifications','ai_audit_trail',
    'voice_commands','consents','audit_logs', 'users'];
  for (const t of clears) await db.run(`DELETE FROM ${t}`);

  // Hospital
  await db.run(`INSERT OR REPLACE INTO hospital VALUES (1,'Apex Medical Center','Ansari Nagar, New Delhi - 110029','New Delhi','+91-11-2658-8500',250,'APEX2026')`);

  // Staff
  const staffList = [
    ['Dr. Arun Sharma','admin','Administration','Hospital Director',22,'9810001111','Available','Day'],
    ['Ravi Kapoor','acc','Emergency','Ambulance Dispatcher',8,'9810002222','Available','Day'],
    ['Dr. Priya Mehta','dept_head','Cardiology','Cardiologist',15,'9810003333','Busy','Day'],
    ['Dr. Suresh Verma','er_doctor','Emergency','Emergency Medicine',10,'9810004444','Available','Night'],
    ['Dr. Neha Gupta','dept_head','Surgery','General Surgeon',12,'9810005555','Busy','Day'],
    ['Dr. Amit Singh','dept_head','Neurology','Neurologist',14,'9810006666','Available','Day'],
    ['Dr. Rekha Joshi','dept_head','Maternity','Obstetrician',18,'9810007777','Busy','Day'],
    ['Dr. Vijay Nair','radiologist','Radiology','Radiologist',9,'9810008888','Available','Day'],
    ['Sunita Devi','nurse','Emergency','ER Nurse',6,'9810009999','Available','Night'],
    ['Kavita Rao','nurse','ICU','ICU Nurse',8,'9810010101','Busy','Day'],
    ['Meena Patel','nurse','Maternity','Maternity Nurse',5,'9810010202','Available','Day'],
    ['Ajay Kumar','nurse','Surgery','Scrub Nurse',7,'9810010303','Busy','Day'],
    ['Pooja Sharma','nurse','General','Ward Nurse',4,'9810010404','Available','Day'],
    ['Rajesh Tiwari','paramedic','Emergency','Senior Paramedic',6,'9810010505','Busy','Day'],
    ['Mohan Das','paramedic','Emergency','Paramedic',3,'9810010606','Available','Day'],
    ['Ananya Singh','lab_tech','Laboratory','Pathology',5,'9810010707','Available','Day'],
    ['Dr. Karan Malhotra','er_doctor','Emergency','Trauma Surgeon',11,'9810010808','Available','Day'],
  ];

  const bcrypt = require('bcryptjs');
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  
  const staffIds = {};
  for (const s of staffList) {
    const r = await db.run(
      `INSERT INTO staff (name,role,department,specialization,experience_yrs,phone,availability,shift) VALUES (?,?,?,?,?,?,?,?)`, s
    );
    const staffId = r.lastInsertRowid;
    staffIds[s[0]] = staffId;
    
    // Create user login for staff — seeded users are auto-approved
    const email = s[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '@apex.com';
    await db.run(
      `INSERT INTO users (hospital_id, email, password_hash, role, profile_id, approval_status) VALUES (?,?,?,?,?, 'approved')`,
      [1, email, defaultPasswordHash, s[1], staffId]
    );
  }

  // Ambulances
  await db.run(`INSERT INTO ambulances (unit_name,status,driver_name,paramedic_id) VALUES (?,?,?,?)`, ['Unit 7-Alpha','Busy','Deepak Singh',staffIds['Rajesh Tiwari']]);
  await db.run(`INSERT INTO ambulances (unit_name,status,driver_name,paramedic_id) VALUES (?,?,?,?)`, ['Unit 4-Bravo','Available','Sanjay Pal',staffIds['Mohan Das']]);
  await db.run(`INSERT INTO ambulances (unit_name,status,driver_name) VALUES (?,?,?)`, ['Unit 2-Delta','Available','Ram Kishore']);
  await db.run(`INSERT INTO ambulances (unit_name,status,driver_name) VALUES (?,?,?)`, ['Unit 5-Echo','Maintenance','Vivek Kumar']);
  await db.run(`INSERT INTO ambulances (unit_name,status,driver_name) VALUES (?,?,?)`, ['Unit 1-Foxt','Available','Anil Sharma']);

  // Patients
  const pts = [
    ['Mrs. Priya Sharma','MRN-2024-001',68,'F','B+','Ward A','4A','4A-1','Cardiology','Acute STEMI - Post PCI',88,'High',92,'148/92',95,99.1,'ICU',staffIds['Dr. Priya Mehta']],
    ['Mr. Rajesh Gupta','MRN-2024-002',54,'M','O+','Ward B','2B','2B-1','Surgery','Appendectomy Recovery',32,'Low',74,'118/72',98,98.6,'Admitted',staffIds['Dr. Neha Gupta']],
    ['Mr. Arjun Kapoor','MRN-2024-003',61,'M','A-','Ward C','6B','6B-2','Neurology','Ischaemic Stroke Recovery',65,'Medium',80,'138/86',97,98.8,'Admitted',staffIds['Dr. Amit Singh']],
    ['Mrs. Sunita Menon','MRN-2024-004',45,'F','AB+','Ward B','3A','3A-1','General','Type 2 Diabetes Hyperglycemia',48,'Medium',82,'136/84',97,98.6,'Admitted',staffIds['Dr. Karan Malhotra']],
    ['Mr. Vikram Singh','MRN-2024-005',38,'M','B-','Ward A','1C','1C-3','Surgery','Laparoscopic Cholecystectomy',18,'Low',68,'112/70',99,98.4,'Admitted',staffIds['Dr. Neha Gupta']],
    ['Mrs. Anjali Roy','MRN-2024-006',72,'F','O-','ICU','ICU-2','ICU-2','ICU','Septic Shock Multi-organ',95,'High',110,'90/60',91,101.2,'Critical',staffIds['Dr. Suresh Verma']],
    ['Mr. Mohan Iyer','MRN-2024-007',59,'M','A+','Ward D','8A','8A-2','Cardiology','Unstable Angina',72,'High',96,'152/96',94,99.0,'Admitted',staffIds['Dr. Priya Mehta']],
    ['Mr. Ravi Joshi','MRN-2024-008',29,'M','B+','Ward B','5C','5C-1','Surgery','Tibial Fracture Post Op',22,'Low',70,'116/74',99,98.5,'Admitted',staffIds['Dr. Neha Gupta']],
    ['Mrs. Lakshmi Pillai','MRN-2024-009',65,'F','O+','Ward A','2A','2A-3','Neurology','Parkinsons Disease Management',55,'Medium',76,'128/80',98,98.6,'Admitted',staffIds['Dr. Amit Singh']],
    ['Mr. Deepak Rao','MRN-2024-010',43,'M','AB-','Ward C','9B','9B-1','General','Pneumonia Resolving',35,'Low',84,'122/78',96,100.1,'Admitted',staffIds['Dr. Karan Malhotra']],
    ['Mrs. Kaveri Nair','MRN-2024-011',52,'F','B+','ICU','ICU-4','ICU-4','ICU','ARDS Ventilator Dependent',90,'High',106,'88/56',88,101.8,'Critical',staffIds['Dr. Suresh Verma']],
    ['Mr. Sandeep Tiwari','MRN-2024-012',34,'M','A+','Ward D','11C','11C-2','General','Viral Fever Dengue Suspect',40,'Medium',88,'114/72',97,103.2,'Admitted',staffIds['Dr. Karan Malhotra']],
    ['Mrs. Radha Yadav','MRN-2024-013',78,'F','O+','Ward A','3C','3C-1','Cardiology','CHF Fluid Overload',82,'High',100,'158/98',93,99.2,'Admitted',staffIds['Dr. Priya Mehta']],
    ['Mr. Aditya Kumar','MRN-2024-014',22,'M','B-','Ward B','14A','14A-1','Surgery','Trauma RTA Polytrauma',78,'High',98,'100/64',95,99.5,'Admitted',staffIds['Dr. Neha Gupta']],
    ['Mrs. Geeta Sharma','MRN-2024-015',48,'F','A-','Ward C','7B','7B-2','Neurology','Epilepsy Post-Seizure',58,'Medium',78,'126/80',98,98.7,'Admitted',staffIds['Dr. Amit Singh']],
  ];

  const patientIds = {};
  for (const p of pts) {
    const r = await db.run(
      `INSERT INTO patients (name,mrn,age,gender,blood_group,ward,bed,room,department,diagnosis,risk_score,risk_label,hr,bp,spo2,temp,status,attending_doctor_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, p
    );
    patientIds[p[0]] = r.lastInsertRowid;
  }

  // Lab Tests
  const labs = [
    [patientIds['Mrs. Priya Sharma'], 'Mrs. Priya Sharma','ICU-2',staffIds['Dr. Priya Mehta'],'Cardiac Troponin I','Blood','In Progress','Stat',null,0],
    [patientIds['Mrs. Priya Sharma'], 'Mrs. Priya Sharma','ICU-2',staffIds['Dr. Priya Mehta'],'BNP / NT-proBNP','Blood','Pending','Stat',null,0],
    [patientIds['Mrs. Anjali Roy'],   'Mrs. Anjali Roy','ICU-2',staffIds['Dr. Suresh Verma'],'Blood Culture x2','Culture','In Progress','Stat',null,0],
    [patientIds['Mrs. Anjali Roy'],   'Mrs. Anjali Roy','ICU-2',staffIds['Dr. Suresh Verma'],'Procalcitonin','Blood','Completed','Urgent','45.2 ng/mL — CRITICAL',1],
    [patientIds['Mr. Rajesh Gupta'],  'Mr. Rajesh Gupta','2B-1',staffIds['Dr. Neha Gupta'],'CBC + Differential','Blood','Completed','Normal','WBC 8.2, Hb 13.4 — Normal',0],
    [patientIds['Mr. Mohan Iyer'],    'Mr. Mohan Iyer','8A-2',staffIds['Dr. Priya Mehta'],'Lipid Profile','Blood','Completed','Urgent','LDL 185 mg/dL — Elevated',1],
    [patientIds['Mr. Arjun Kapoor'], 'Mr. Arjun Kapoor','6B-2',staffIds['Dr. Amit Singh'],'Coagulation Profile','Blood','Pending','Urgent',null,0],
    [patientIds['Mr. Deepak Rao'],   'Mr. Deepak Rao','9B-1',staffIds['Dr. Karan Malhotra'],'Sputum Culture','Culture','In Progress','Normal',null,0],
    [patientIds['Mr. Sandeep Tiwari'],'Mr. Sandeep Tiwari','11C-2',staffIds['Dr. Karan Malhotra'],'NS1 Antigen + Dengue IgM','Blood','Pending','Urgent',null,0],
    [patientIds['Mrs. Radha Yadav'], 'Mrs. Radha Yadav','3C-1',staffIds['Dr. Priya Mehta'],'Serum Electrolytes','Blood','Completed','Stat','Na+ 128 mEq/L — LOW',1],
    [patientIds['Mrs. Sunita Menon'],'Mrs. Sunita Menon','3A-1',staffIds['Dr. Karan Malhotra'],'HbA1c + Fasting Glucose','Blood','Completed','Normal','HbA1c 9.2% — Uncontrolled',1],
    [patientIds['Mr. Aditya Kumar'], 'Mr. Aditya Kumar','14A-1',staffIds['Dr. Neha Gupta'],'Crossmatch O-Neg Blood','Blood','Completed','Stat','Compatible — 2 units reserved',0],
  ];
  for (const l of labs) await db.run(`INSERT INTO lab_tests (patient_id,patient_name,patient_room,ordered_by,test_name,test_type,status,priority,result,flagged) VALUES (?,?,?,?,?,?,?,?,?,?)`, l);

  // Surgeries
  const surgs = [
    [patientIds['Mrs. Priya Sharma'],'Mrs. Priya Sharma',staffIds['Dr. Priya Mehta'],'Dr. Priya Mehta','OT-01','Percutaneous Coronary Intervention','In Progress','Emergency',null],
    [patientIds['Mr. Aditya Kumar'], 'Mr. Aditya Kumar', staffIds['Dr. Neha Gupta'], 'Dr. Neha Gupta', 'OT-02','Damage Control Surgery — Polytrauma','Scheduled','Emergency',12],
    [patientIds['Mr. Rajesh Gupta'], 'Mr. Rajesh Gupta', staffIds['Dr. Neha Gupta'], 'Dr. Neha Gupta', 'OT-03','Laparoscopic Appendectomy','Completed','Urgent',null],
    [patientIds['Mr. Vikram Singh'],  'Mr. Vikram Singh',  staffIds['Dr. Neha Gupta'], 'Dr. Neha Gupta', 'OT-03','Laparoscopic Cholecystectomy','Scheduled','Elective',null],
    [patientIds['Mr. Ravi Joshi'],   'Mr. Ravi Joshi',   staffIds['Dr. Neha Gupta'], 'Dr. Neha Gupta', 'OT-04','ORIF Tibial Fracture','Completed','Urgent',null],
    [patientIds['Mrs. Geeta Sharma'],'Mrs. Geeta Sharma',staffIds['Dr. Amit Singh'], 'Dr. Amit Singh', 'OT-05','EEG + Medication Adjustment','Scheduled','Elective',null],
  ];
  for (const s of surgs) await db.run(`INSERT INTO surgeries (patient_id,patient_name,surgeon_id,surgeon_name,ot_room,procedure,status,priority,eta_mins,scheduled_at) VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))`, s);

  // OPD Queue
  const opdQ = [
    ['G-1102','Robert Jameson',45,'General Medicine',staffIds['Dr. Karan Malhotra'],22,'High','With Doctor'],
    ['P-4091','Elena Mendez',8,'Pediatrics',null,8,'Medium','Waiting'],
    ['C-2231','David Smith',62,'Cardiology',staffIds['Dr. Priya Mehta'],45,'Low','Waiting'],
    ['E-8820','Priya Kaur',34,'ENT',null,5,'Medium','Waiting'],
    ['O-3312','Meera Jain',28,'Ophthalmology',null,55,'Low','Waiting'],
    ['N-5521','Rahul Verma',19,'Neurology',staffIds['Dr. Amit Singh'],15,'Medium','Waiting'],
  ];
  for (const o of opdQ) await db.run(`INSERT INTO opd_queue (token,patient_name,age,department,doctor_id,wait_mins,ai_priority,status) VALUES (?,?,?,?,?,?,?,?)`, o);

  // Maternity
  const mat = [
    [null,'Mrs. Anita Desai',28,'M-101',38,staffIds['Dr. Rekha Joshi'],'Dr. Rekha Joshi','In Labour',0],
    [null,'Mrs. Sunita Pillai',32,'M-102',34,staffIds['Dr. Rekha Joshi'],'Dr. Rekha Joshi','Admitted',1],
    [null,'Mrs. Kavita Bose',25,'M-103',40,staffIds['Dr. Rekha Joshi'],'Dr. Rekha Joshi','Post-Natal',0],
    [null,'Mrs. Ritu Singh',30,'M-104',36,staffIds['Dr. Rekha Joshi'],'Dr. Rekha Joshi','Admitted',0],
  ];
  for (const m of mat) await db.run(`INSERT INTO maternity_patients (patient_id,patient_name,age,room,gestation_weeks,doctor_id,doctor_name,status,nicu_required) VALUES (?,?,?,?,?,?,?,?,?)`, m);

  // Radiology
  const radId = staffIds['Dr. Vijay Nair'];
  const rads = [
    [patientIds['Mrs. Priya Sharma'],'Mrs. Priya Sharma','ICU-2','Echocardiogram','Heart',staffIds['Dr. Priya Mehta'],radId,'Reported','Stat','EF 35% — Severely reduced. Regional wall motion abnormality.'],
    [patientIds['Mr. Arjun Kapoor'], 'Mr. Arjun Kapoor','6B-2','MRI','Brain',staffIds['Dr. Amit Singh'],radId,'In Progress','Urgent',null],
    [patientIds['Mr. Aditya Kumar'], 'Mr. Aditya Kumar','14A-1','CT','Chest+Abdomen',staffIds['Dr. Neha Gupta'],radId,'Reported','Stat','Multiple rib fractures. Pneumothorax right. Liver laceration Grade II.'],
    [patientIds['Mr. Deepak Rao'],   'Mr. Deepak Rao','9B-1','X-Ray','Chest',staffIds['Dr. Karan Malhotra'],radId,'Reported','Normal','Bilateral lower lobe consolidation — pneumonia.'],
    [patientIds['Mrs. Kaveri Nair'], 'Mrs. Kaveri Nair','ICU-4','CT','Chest',staffIds['Dr. Suresh Verma'],radId,'Reported','Stat','Bilateral ground-glass opacities — ARDS confirmed.'],
    [patientIds['Mrs. Sunita Menon'],'Mrs. Sunita Menon','3A-1','Ultrasound','Abdomen',staffIds['Dr. Karan Malhotra'],radId,'Scheduled','Routine',null],
    [patientIds['Mrs. Geeta Sharma'],'Mrs. Geeta Sharma','7B-2','MRI','Brain',staffIds['Dr. Amit Singh'],radId,'Scheduled','Urgent',null],
  ];
  for (const r of rads) await db.run(`INSERT INTO radiology_scans (patient_id,patient_name,patient_room,scan_type,body_part,ordered_by,radiologist_id,status,priority,report) VALUES (?,?,?,?,?,?,?,?,?,?)`, r);

  // Emergency alert
  await db.run(
    `INSERT INTO emergency_alerts (paramedic_id,ambulance_unit,raw_input,condition_summary,severity,departments,preparation,clinical_note,eta_minutes,status,ai_confidence)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [staffIds['Rajesh Tiwari'],'Unit 7-Alpha','55M severe chest pain sweating BP 80/50 unconscious',
     'Acute STEMI with Cardiogenic Shock','Critical',
     JSON.stringify(['Cardiology','ICU','Emergency']),
     JSON.stringify(['Activate Cath Lab','Prepare defibrillator','IV access x2','O-Neg blood standby']),
     'Classic STEMI with haemodynamic compromise. Urgent PCI required.',6,'En Route',96]
  );

  // Notifications
  const notifs = [
    ['emergency','🚨 Critical Alert — Unit 7-Alpha','Acute STEMI with Cardiogenic Shock. ETA 6 min.','Cardiology','all'],
    ['lab','🔴 Critical Lab Result','Mrs. Anjali Roy — Procalcitonin 45.2 ng/mL. Sepsis protocol.','Laboratory','er_doctor'],
    ['ai','🧠 AI Bed Optimizer','3 patients predicted for discharge within 24h. Beds 4A, 2B, 5C.','Administration','admin'],
    ['system','✅ System Ready','Apex Medical Center backend is online.','All','all'],
  ];
  for (const n of notifs) await db.run(`INSERT INTO notifications (type,title,message,department,target_role) VALUES (?,?,?,?,?)`, n);

  console.log('✅ Database seeded — Apex Medical Center is live!');
  console.log(`   Staff: ${staffList.length} | Patients: ${pts.length} | Ambulances: 5`);
  setTimeout(() => process.exit(0), 500);
}

seed().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
