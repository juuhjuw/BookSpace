const express = require('express');
const cors = require('cors');

const perfilRoutes = require('./routes/perfil.routes');
const diarioRoutes = require('./routes/diario.routes');
const redeApoioRoutes = require('./routes/redeApoio.routes');
const autoavaliacaoRoutes = require('./routes/autoavaliacao.routes');
const modeloRoutes = require('./routes/modelo.routes');

const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:8081,http://127.0.0.1:8081')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

const app = express();

app.use(cors({
  origin(origem, callback) {
    if (!origem || origensPermitidas.includes(origem)) {
      return callback(null, true);
    }

    return callback(new Error('Origem não permitida.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '32kb' }));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API BookSpace funcionando!' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/usuarios', perfilRoutes);
app.use('/diarios', diarioRoutes);
app.use('/rede-apoio', redeApoioRoutes);
app.use('/autoavaliacoes', autoavaliacaoRoutes);
app.use('/modelo', modeloRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }

  if (erro.message === 'Origem não permitida.') {
    return res.status(403).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
