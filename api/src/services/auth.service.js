const { randomBytes } = require('node:crypto');
const { hashSecret, verifySecret, tokenHash } = require('../utils/crypto');
const { HttpError } = require('../utils/errors');
const { profileModel } = require('../models/perfil.model');

function authService(db, sessionHours) {
  const profiles = profileModel(db);
  // Hash fictício reduz a diferença de trabalho entre e-mail ausente e senha errada.
  const dummyHash = hashSecret(randomBytes(32).toString('hex'));
  return {
    async register(body) {
      const senhaHash = await hashSecret(body.senha);
      const pinHash = await hashSecret(body.pin);
      return profiles.create({ ...body, senhaHash, pinHash });
    },
    async login({ email, senha }) {
      const user = await profiles.credentials(email);
      const valid = await verifySecret(senha, user?.senha_hash || await dummyHash);
      if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
      const token = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + sessionHours * 3600000);
      await db.execute('INSERT INTO Sessoes (token_hash,user_id,expira_em) VALUES (?,?,?)',
        [tokenHash(token), user.id, expires]);
      return { token, tokenType: 'Bearer', expiraEm: expires.toISOString() };
    },
    async logout(hash) {
      await db.execute('DELETE FROM Sessoes WHERE token_hash = ?', [hash]);
    },
    async verifyPassword(id, senha) {
      const secrets = await profiles.secrets(id);
      if (!secrets || !await verifySecret(senha, secrets.senha_hash)) {
        throw new HttpError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas.');
      }
    },
    async verifyPin(id, pin) {
      const secrets = await profiles.secrets(id);
      if (!secrets || !await verifySecret(pin, secrets.pin_hash)) {
        throw new HttpError(401, 'INVALID_PIN', 'PIN inválido.');
      }
      // Confirmação apenas: ainda não cria segunda autorização para os CRUDs.
      return { valido: true };
    },
    async changePin(id, body) {
      await this.verifyPassword(id, body.senha);
      await profiles.changePin(id, await hashSecret(body.pin));
    },
  };
}
module.exports = { authService };
