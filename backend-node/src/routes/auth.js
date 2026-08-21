const router = require('express').Router();
const db     = require('../db/index');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'clinicalpulse_super_secret_key_2026';

// Role → default route mapping
const ROLE_ROUTES = {
  admin:       '/admin',
  acc:         '/emergency',
  er_doctor:   '/emergency',
  dept_head:   '/emergency',   
  nurse:       '/nursing',
  paramedic:   '/emergency',
  radiologist: '/radiology',
  lab_tech:    '/lab',
  pharmacist:  '/pharmacy',
  patient:     '/patient/portal'
};

const DEPT_ROUTES = {
  Cardiology: '/doctor',
  Surgery:    '/surgery',
  Maternity:  '/maternity',
  Neurology:  '/doctor',
  Laboratory: '/lab',
  Radiology:  '/radiology',
  Pharmacy:   '/pharmacy',
  General:    '/opd',
  ICU:        '/nursing',
};

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, hospital_id } = req.body; 
    if (!email || !password || !hospital_id) return res.status(400).json({ error: 'Email, password, and hospital required' });

    // Find user
    const user = await db.get(`SELECT * FROM users WHERE email=? AND hospital_id=?`, [email.toLowerCase(), hospital_id]);
    if (!user) return res.status(401).json({ error: 'Invalid email, password, or hospital' });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });

    // Check approval
    if (user.approval_status !== 'approved') {
      return res.status(403).json({ error: 'Your account is pending admin approval. Please contact your hospital administrator.' });
    }

    // Fetch profile (staff or patient)
    let profile = null;
    if (user.role === 'patient') {
      profile = await db.get(`SELECT * FROM patients WHERE id=?`, [user.profile_id]);
    } else {
      profile = await db.get(`SELECT * FROM staff WHERE id=?`, [user.profile_id]);
    }

    // Fetch hospital name
    const hospital = await db.get(`SELECT name FROM hospital WHERE id=?`, [user.hospital_id]);

    // Determine redirect route
    let redirect = ROLE_ROUTES[user.role] || '/';
    if (profile && profile.role === 'dept_head' && profile.department && DEPT_ROUTES[profile.department]) {
      redirect = DEPT_ROUTES[profile.department];
    }

    // Generate JWT — 24hr expiry
    const token = jwt.sign({ id: user.id, role: user.role, hospital_id: user.hospital_id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id:             user.id,
        email:          user.email,
        role:           user.role,
        profile_id:     user.profile_id,
        name:           profile?.name || 'Unknown',
        department:     profile?.department,
        hospital_id:    user.hospital_id,
        hospital_name:  hospital?.name || 'Unknown Hospital',
      },
      redirect,
      emergencyRole: ['paramedic', 'acc', 'er_doctor', 'dept_head'].includes(user.role)
        ? user.role === 'dept_head' ? 'Doctor' : user.role === 'acc' ? 'ACC' : user.role === 'paramedic' ? 'Paramedic' : 'Doctor'
        : null,
    });
  } catch (e) { next(e); }
});

// GET /api/auth/hospitals
router.get('/hospitals', async (req, res, next) => {
  try {
    const hospitals = await db.all(`SELECT id, name, city, total_beds FROM hospital`);
    res.json({ success: true, hospitals });
  } catch (e) { next(e); }
});

// POST /api/auth/register-hospital
router.post('/register-hospital', async (req, res, next) => {
  try {
    const { name, address, city, phone, adminEmail, adminPassword } = req.body;
    
    // Generate access code
    const accessCode = name.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
    
    const hResult = await db.run(
      `INSERT INTO hospital (name, address, city, phone, total_beds, access_code) VALUES (?, ?, ?, ?, 250, ?)`,
      [name, address, city, phone, accessCode]
    );
    const hospitalId = hResult.lastInsertRowid;

    // Create Admin Staff profile
    const sResult = await db.run(
      `INSERT INTO staff (name, role, department) VALUES (?, 'admin', 'Administration')`,
      ['Hospital Admin']
    );

    // Create Admin User
    const hash = await bcrypt.hash(adminPassword, 10);
    await db.run(
      `INSERT INTO users (hospital_id, email, password_hash, role, profile_id, approval_status) VALUES (?, ?, ?, 'admin', ?, 'approved')`,
      [hospitalId, adminEmail.toLowerCase(), hash, sResult.lastInsertRowid]
    );

    res.json({ success: true, hospitalId, accessCode, message: 'Hospital registered successfully' });
  } catch(e) { next(e); }
});

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { accessCode, name, email, password, role, department } = req.body;
    
    const hospital = await db.get(`SELECT * FROM hospital WHERE access_code=?`, [accessCode]);
    if (!hospital) return res.status(400).json({ error: 'Invalid hospital access code' });

    const existing = await db.get(`SELECT * FROM users WHERE email=?`, [email.toLowerCase()]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Create Profile
    const sResult = await db.run(
      `INSERT INTO staff (name, role, department) VALUES (?, ?, ?)`,
      [name, role, department || 'General']
    );

    // Create User
    const hash = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (hospital_id, email, password_hash, role, profile_id) VALUES (?, ?, ?, ?, ?)`,
      [hospital.id, email.toLowerCase(), hash, role, sResult.lastInsertRowid]
    );

    res.json({ success: true, message: 'Account created successfully' });
  } catch(e) { next(e); }
});

// GET /api/auth/me  (verify token)
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, user: decoded });
  } catch(e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/auth/pending-users?hospital_id=X  (admin only — returns users awaiting approval)
router.get('/pending-users', async (req, res, next) => {
  try {
    const { hospital_id } = req.query;
    if (!hospital_id) return res.status(400).json({ error: 'hospital_id required' });
    const users = await db.all(
      `SELECT u.id, u.email, u.role, u.created_at, s.name, s.department FROM users u
       LEFT JOIN staff s ON s.id = u.profile_id
       WHERE u.hospital_id=? AND u.approval_status='pending'`,
      [hospital_id]
    );
    res.json({ success: true, users });
  } catch(e) { next(e); }
});

// PATCH /api/auth/approve-user  (admin only)
router.patch('/approve-user', async (req, res, next) => {
  try {
    const { user_id, action } = req.body; // action = 'approve' | 'reject'
    if (!user_id || !action) return res.status(400).json({ error: 'user_id and action required' });
    const status = action === 'approve' ? 'approved' : 'rejected';
    await db.run(`UPDATE users SET approval_status=? WHERE id=?`, [status, user_id]);
    res.json({ success: true, message: `User ${status}` });
  } catch(e) { next(e); }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ success: true }));

module.exports = router;
