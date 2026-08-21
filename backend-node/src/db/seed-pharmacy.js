require('dotenv').config();
const db = require('./index');
const { initSchema } = require('./schema');

const MEDICINES = [
  // Category, Name, Generic, Unit, Qty, ReorderLevel, Location, Price
  ['Analgesic',      'Aspirin 75mg',            'Acetylsalicylic Acid',  'tablets', 500, 100, 'Rack A-1', 2.5],
  ['Analgesic',      'Paracetamol 500mg',        'Acetaminophen',         'tablets', 800, 150, 'Rack A-2', 1.8],
  ['Analgesic',      'Ibuprofen 400mg',          'Ibuprofen',             'tablets', 350, 80,  'Rack A-3', 3.2],
  ['Antibiotic',     'Amoxicillin 500mg',        'Amoxicillin',           'capsules',300, 60,  'Rack B-1', 8.0],
  ['Antibiotic',     'Ceftriaxone 1g IV',        'Ceftriaxone',           'vials',   80,  20,  'Fridge F-1', 95.0],
  ['Antibiotic',     'Azithromycin 500mg',       'Azithromycin',          'tablets', 200, 50,  'Rack B-2', 12.5],
  ['Antibiotic',     'Metronidazole 400mg',      'Metronidazole',         'tablets', 250, 60,  'Rack B-3', 4.5],
  ['Cardiac',        'Atorvastatin 40mg',        'Atorvastatin',          'tablets', 400, 80,  'Rack C-1', 15.0],
  ['Cardiac',        'Amlodipine 5mg',           'Amlodipine',            'tablets', 300, 70,  'Rack C-2', 6.5],
  ['Cardiac',        'Metoprolol 50mg',          'Metoprolol Succinate',  'tablets', 180, 50,  'Rack C-3', 9.0],
  ['Cardiac',        'Warfarin 5mg',             'Warfarin Sodium',       'tablets', 120, 30,  'Rack C-4', 18.0],
  ['IV Fluid',       'Normal Saline 0.9% 500ml', 'Sodium Chloride',       'bags',    60,  20,  'Shelf S-1', 55.0],
  ['IV Fluid',       'Ringer Lactate 500ml',     'Lactated Ringer',       'bags',    45,  20,  'Shelf S-2', 65.0],
  ['IV Fluid',       'Dextrose 5% 500ml',        '5% Dextrose',           'bags',    30,  15,  'Shelf S-3', 70.0],
  ['Antihypertensive','Enalapril 5mg',           'Enalapril Maleate',     'tablets', 160, 40,  'Rack D-1', 7.0],
  ['Antihypertensive','Telmisartan 40mg',        'Telmisartan',           'tablets', 140, 40,  'Rack D-2', 11.0],
  ['Antidiabetic',   'Metformin 500mg',          'Metformin HCl',         'tablets', 350, 70,  'Rack E-1', 3.5],
  ['Antidiabetic',   'Glimepiride 2mg',          'Glimepiride',           'tablets', 200, 50,  'Rack E-2', 8.5],
  ['Antidiabetic',   'Insulin Glargine 100IU',   'Insulin Glargine',      'pens',    25,  10,  'Fridge F-2', 850.0],
  ['Emergency',      'Adrenaline 1mg/ml',        'Epinephrine',           'ampoules',40,  15,  'Emergency Tray', 45.0],
  ['Emergency',      'Atropine 0.6mg/ml',        'Atropine Sulfate',      'ampoules',30,  10,  'Emergency Tray', 38.0],
  ['Emergency',      'Norepinephrine 4mg',       'Noradrenaline',         'ampoules',20,  8,   'ICU Fridge', 220.0],
  ['Emergency',      'Morphine 10mg/ml',         'Morphine Sulfate',      'ampoules',15,  5,   'Controlled-1', 180.0],
  ['Antacid',        'Pantoprazole 40mg',        'Pantoprazole Sodium',   'tablets', 450, 100, 'Rack G-1', 5.0],
  ['Anticoagulant',  'Enoxaparin 40mg',          'Enoxaparin Sodium',     'syringes',35,  12,  'Fridge F-3', 320.0],
  ['Neuro',          'Phenytoin 100mg',          'Phenytoin Sodium',      'capsules',90,  25,  'Rack H-1', 7.5],
  ['Neuro',          'Levetiracetam 500mg',      'Levetiracetam',         'tablets', 75,  20,  'Rack H-2', 22.0],
  ['Steroid',        'Dexamethasone 4mg',        'Dexamethasone',         'ampoules',50,  15,  'Rack I-1', 28.0],
  ['Steroid',        'Methylprednisolone 40mg',  'Methylprednisolone',    'vials',   25,  10,  'Rack I-2', 85.0],
  ['Respiratory',    'Salbutamol Inhaler',       'Albuterol',             'inhalers',60,  15,  'Rack J-1', 95.0],
];

async function seedPharmacy() {
  await initSchema();

  // Seed stock per hospital
  const hospitals = await db.all(`SELECT id FROM hospital`);
  if (!hospitals.length) { console.log('⚠️ No hospitals found. Run main seed first.'); process.exit(1); }

  let added = 0;
  for (const h of hospitals) {
    for (const [category, name, generic_name, unit, quantity, reorder_level, location, price_per_unit] of MEDICINES) {
      const exists = await db.get(`SELECT id FROM pharmacy_stock WHERE hospital_id=? AND name=?`, [h.id, name]);
      if (!exists) {
        await db.run(
          `INSERT INTO pharmacy_stock (hospital_id,name,generic_name,category,unit,quantity,reorder_level,location,price_per_unit) VALUES (?,?,?,?,?,?,?,?,?)`,
          [h.id, name, generic_name, category, unit, quantity, reorder_level, location, price_per_unit]
        );
        added++;
      }
    }
  }

  // Seed sample orders from nurses (voice source)
  const patients = await db.all(`SELECT id,name,bed,room,ward,department FROM patients LIMIT 5`);
  const nurses = await db.all(`SELECT id,name FROM staff WHERE role='nurse' LIMIT 3`);
  const sampleOrders = [
    { idx:0, med:'Ceftriaxone 1g IV',     qty:1, unit:'vials',    priority:'Stat',    source:'voice', notes:'Patient running high fever 103.2°F' },
    { idx:1, med:'Normal Saline 0.9% 500ml', qty:2, unit:'bags', priority:'Urgent',  source:'voice', notes:'Patient is dehydrated, IV drip needed' },
    { idx:2, med:'Paracetamol 500mg',     qty:2, unit:'tablets',  priority:'Routine', source:'voice', notes:'For pain management' },
    { idx:3, med:'Pantoprazole 40mg',     qty:1, unit:'tablets',  priority:'Routine', source:'manual', notes:'' },
    { idx:4, med:'Enoxaparin 40mg',       qty:1, unit:'syringes', priority:'Urgent',  source:'manual', notes:'Post-surgical prophylaxis' },
  ];
  if (hospitals.length && patients.length) {
    const hid = hospitals[0].id;
    for (const o of sampleOrders) {
      const p = patients[o.idx] || patients[0];
      const n = nurses[o.idx % nurses.length];
      const exists = await db.get(`SELECT id FROM pharmacy_orders WHERE hospital_id=? AND patient_name=? AND medicine_name=?`, [hid, p.name, o.med]);
      if (!exists) {
        await db.run(
          `INSERT INTO pharmacy_orders (hospital_id,patient_id,patient_name,bed,room,ward,department,medicine_name,quantity,unit,priority,ordered_by,ordered_by_name,source,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [hid, p.id, p.name, p.bed||'', p.room||'', p.ward||'', p.department||'', o.med, o.qty, o.unit, o.priority, n?.id||null, n?.name||'Ward Nurse', o.source, o.notes]
        );
      }
    }
  }

  console.log(`✅ Pharmacy seeded: ${added} medicines × ${hospitals.length} hospitals`);
  setTimeout(() => process.exit(0), 300);
}

seedPharmacy().catch(e => { console.error('Pharmacy seed failed:', e.message); process.exit(1); });
