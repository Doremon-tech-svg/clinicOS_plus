require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const { initSchema } = require('./db/schema');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' }));

// Routes
app.use('/api/patients',      require('./routes/patients'));
app.use('/api/emergency',     require('./routes/emergency'));
app.use('/api/ambulance',     require('./routes/emergency'));
app.use('/api/lab',           require('./routes/lab'));
app.use('/api/surgery',       require('./routes/surgery'));
app.use('/api/opd',           require('./routes/opd'));
app.use('/api/maternity',     require('./routes/maternity'));
app.use('/api/radiology',     require('./routes/radiology'));
app.use('/api/nursing',       require('./routes/nursing'));
app.use('/api/voice',         require('./routes/nursing'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/blockchain',    require('./routes/blockchain'));
app.use('/api/admin',         require('./routes/blockchain'));
app.use('/api/patient',       require('./routes/blockchain'));
app.use('/api/staff',         require('./routes/staff'));
app.use('/api/auth',          require('./routes/auth'));

// Removed invalid legacy routing; use proper /api/emergency/* routes instead.

// Bed optimizer alias
app.get('/api/bed-optimizer', async (req, res, next) => {
  req.url = '/bed-optimizer/predict';
  require('./routes/patients')(req, res, next);
});

// Health
app.get('/',       (req, res) => res.json({ status:'Apex Medical Center — API Online ✅', version:'1.0.0' }));
app.get('/health', (req, res) => res.json({ status:'ok', ts:new Date().toISOString() }));

app.use(require('./middleware/errorHandler'));

// Init schema then export
async function bootstrap() {
  await initSchema();
  return app;
}

module.exports = { app, bootstrap };
