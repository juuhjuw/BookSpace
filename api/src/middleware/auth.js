const crypto = require('crypto');

const DURACAO_SESSAO_MS = 12 * 60 * 60 * 1000;
const sessoes = new Map();

function criarSessao(userId) {
  for (const [tokenExistente, sessao] of sessoes) {
    if (sessao.expiraEm <= Date.now()) sessoes.delete(tokenExistente);
  }
  removerSessoes(userId);
  const token = crypto.randomBytes(32).toString('hex');
  sessoes.set(token, { userId, expiraEm: Date.now() + DURACAO_SESSAO_MS });
  return token;
}

function removerSessoes(userId) {
  for (const [token, sessao] of sessoes) {
    if (sessao.userId === userId) sessoes.delete(token);
  }
}

function exigirSessao(req, res, next) {
  const autorizacao = req.get('Authorization') || '';
  const correspondencia = autorizacao.match(/^Bearer\s+(.+)$/i);
  const token = correspondencia ? correspondencia[1] : '';
  const sessao = sessoes.get(token);

  if (!sessao || sessao.expiraEm <= Date.now()) {
    if (token) sessoes.delete(token);
    return res.status(401).json({ erro: 'Sessão inválida ou expirada. Entre novamente.' });
  }

  req.userId = sessao.userId;
  return next();
}

function exigirProprioPerfil(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID do perfil inválido.' });
  }
  if (id !== req.userId) {
    return res.status(404).json({ erro: 'Perfil não encontrado.' });
  }
  return next();
}

function validarUsuarioSolicitado(req, res, next) {
  const userIdInformado = req.body?.user_id ?? req.query.user_id;
  if (userIdInformado !== undefined && Number(userIdInformado) !== req.userId) {
    return res.status(404).json({ erro: 'Registro não encontrado.' });
  }
  return next();
}

module.exports = {
  criarSessao,
  removerSessoes,
  exigirSessao,
  exigirProprioPerfil,
  validarUsuarioSolicitado,
};
