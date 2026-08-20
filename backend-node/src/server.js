const { bootstrap } = require('./app');
const PORT = process.env.PORT || 8000;

bootstrap().then(app => {
  app.listen(PORT, () => {
    console.log(`\n🏥  Apex Medical Center — Node.js Backend`);
    console.log(`✅  Running on http://localhost:${PORT}`);
    console.log(`📋  API: GET http://localhost:${PORT}/\n`);
  });
}).catch(err => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
