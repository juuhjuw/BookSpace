const { tokenHash } = require('../utils/crypto');
const { HttpError } = require('../utils/errors');

// Identidade vem exclusivamente da sessão, nunca do corpo da requisição.
function authenticate(db) {
  return async (req, res, next) => {
    const match = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization || '');
    if (!match) throw new HttpError(401, 'UNAUTHORIZED', 'Sessão inválida ou expirada.');
    const hash = tokenHash(match[1]);
    const [rows] = await db.execute(
      'SELECT user_id FROM Sessoes WHERE token_hash = ? AND expira_em > UTC_TIMESTAMP()', [hash],
    );
    if (!rows.length) throw new HttpError(401, 'UNAUTHORIZED', 'Sessão inválida ou expirada.');
    req.auth = { userId: rows[0].user_id, tokenHash: hash };
    next();
  };
}
module.exports = { authenticate };
