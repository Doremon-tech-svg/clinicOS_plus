const { bootstrap } = require('./app');
const db = require('./db');
const { execSync } = require('child_process');
const PORT = process.env.PORT || 8000;

async function runAutoSeed() {
  try {
    const row = await db.get(`SELECT COUNT(*) as count FROM hospital`);
    if (!row || Number(row.count) < 10) {
      console.log('🌱 Partial or empty database detected. Running initial seeds...');
      execSync('node src/db/seed.js', { stdio: 'inherit' });
      execSync('node src/db/seed-hospitals.js', { stdio: 'inherit' });
      execSync('node src/db/seed-pharmacy.js', { stdio: 'inherit' });
      console.log('✅ Auto-seeding complete.');
    }
  } catch (err) {
    console.error('⚠️ Auto-seeding check failed (database might not be initialized yet).');
    // Ignore error, app bootstrap will init schema
  }
}

bootstrap().then(async (app) => {
  await runAutoSeed();
  
  app.listen(PORT, () => {
    console.log(`\n🏥  Apex Medical Center — Node.js Backend`);
    console.log(`✅  Running on http://localhost:${PORT}`);
    console.log(`📋  API: GET http://localhost:${PORT}/\n`);
  });
}).catch(err => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
