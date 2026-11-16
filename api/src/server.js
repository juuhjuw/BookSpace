const env = require('./config/env');
const db = require('./config/database');
const { createApp } = require('./app');

// Migrations/seed são comandos explícitos, nunca efeitos colaterais do servidor.
async function start() {
  await db.query('SELECT 1');
  const app = createApp({ db,
    origins: env.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean),
    sessionHours: env.SESSION_HOURS });
  const server = app.listen(env.PORT, '0.0.0.0', () => console.log(`API BookSpace na porta ${env.PORT}`));
  server.on('error', async () => {
    console.error('Não foi possível abrir a porta da API.');
    await db.end();
    process.exitCode = 1;
  });
  // Encerramento gracioso para não abandonar operações em andamento.
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      await db.end();
      clearTimeout(deadline);
    });
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  // TODO: HTTPS no proxy de publicação e trust proxy restrito à infraestrutura real.
}
start().catch(async () => {
  console.error('Falha ao iniciar API. Confira banco, variáveis e migrations.');
  await db.end();
  process.exitCode = 1;
});
