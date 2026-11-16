const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { authenticate } = require('./middleware/auth');
const { validate, schemas } = require('./middleware/validation');
const { HttpError } = require('./utils/errors');
const { authService } = require('./services/auth.service');

// Injeção do pool permite testar HTTP sem iniciar MySQL no computador.
function createApp({ db, origins = [], sessionHours = 8 }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      // CORS não autentica chamadas. Clientes nativos/curl sem Origin são permitidos.
      callback(origin && !origins.includes(origin)
        ? new HttpError(403, 'ORIGIN_DENIED', 'Origem não permitida.') : null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  const rateError = { error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Aguarde antes de tentar novamente.' } };
  const limiter = (limit, keyGenerator) => rateLimit({
    windowMs: 15 * 60 * 1000, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    message: rateError, ...(keyGenerator ? { keyGenerator } : {}),
  });
  // Store em memória atende desenvolvimento/uma instância. TODO: store compartilhado
  // e limites por conta no login antes de escalar. Não confiar em proxy sem configuração.
  app.use(limiter(200));
  app.use(express.json({ limit: '64kb' }));
  const loginLimit = limiter(10);
  const sensitiveLimit = limiter(5, req => String(req.auth.userId));
  const auth = authService(db, sessionHours);
  const protectedRoute = authenticate(db);

  // Liveness não toca o banco. Readiness confirma conexão sem revelar detalhes.
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/health/ready', async (req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'Banco indisponível.' } });
    }
  });
  app.post('/auth/register', loginLimit, validate(schemas.register), async (req, res) => {
    res.status(201).json(await auth.register(req.body));
  });
  app.post('/auth/login', loginLimit, validate(schemas.login), async (req, res) => {
    res.json(await auth.login(req.body));
  });
  // Sem refresh tokens nesta base: ao expirar, o cliente precisa autenticar novamente.
  app.post('/auth/refresh', () => { throw new HttpError(501, 'NOT_IMPLEMENTED', 'Refresh pendente. Faça login novamente.'); });
  app.post('/auth/logout', protectedRoute, async (req, res) => {
    await auth.logout(req.auth.tokenHash);
    res.status(204).end();
  });
  app.post('/auth/verify-pin', protectedRoute, sensitiveLimit, validate(schemas.pin), async (req, res) => {
    res.json(await auth.verifyPin(req.auth.userId, req.body.pin));
  });
  app.put('/auth/pin', protectedRoute, sensitiveLimit, validate(schemas.changePin), async (req, res) => {
    await auth.changePin(req.auth.userId, req.body);
    res.status(204).end();
  });

  app.use('/perfil', protectedRoute, require('./routes/perfil.routes')(db, auth, sensitiveLimit));
  app.use('/diarios', protectedRoute, require('./routes/diario.routes')(db));
  app.use('/rede-apoio', protectedRoute, require('./routes/redeApoio.routes')(db));
  app.use('/autoavaliacoes', protectedRoute, require('./routes/autoavaliacao.routes')());
  app.get('/dashboard/resumo', protectedRoute, async (req, res) => {
    const id = req.auth.userId;
    // Subconsultas em uma leitura impedem multiplicação de contagens por JOINs.
    const [[row]] = await db.execute(`SELECT
      (SELECT COUNT(*) FROM Diario WHERE user_id = ?) AS totalDiarios,
      (SELECT COUNT(*) FROM Rede_Apoio WHERE user_id = ?) AS totalContatos,
      (SELECT nivel_risco FROM Autoavaliacao WHERE user_id = ? ORDER BY data_avaliacao DESC, id DESC LIMIT 1) AS ultimoNivelRisco`, [id, id, id]);
    res.json(row);
  });
  app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', 'Rota não encontrada.')));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    let status = error instanceof HttpError ? error.status : 500;
    let code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';
    let message = error instanceof HttpError ? error.message : 'Não foi possível concluir a operação.';
    if (error.type === 'entity.parse.failed') [status, code, message] = [400, 'INVALID_JSON', 'JSON inválido.'];
    if (error.type === 'entity.too.large') [status, code, message] = [413, 'BODY_TOO_LARGE', 'Corpo da requisição excede o limite.'];
    if (error.code === 'ER_DUP_ENTRY') [status, code, message] = [409, 'CONFLICT', 'Não foi possível cadastrar com os dados informados.'];
    // Nunca registrar body, headers, SQL ou objeto de erro com dados sensíveis.
    if (status === 500) console.error('Falha interna na API.');
    res.status(status).json({ error: { code, message } });
  });
  return app;
}
module.exports = { createApp };
