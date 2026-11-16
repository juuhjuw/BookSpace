const { randomBytes, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

// Salt individual e scrypt assíncrono: senha/PIN nunca são persistidos em texto puro.
async function hashSecret(secret) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(secret, salt, 64, options);
  return `scrypt$${salt}$${key.toString('hex')}`;
}
async function verifySecret(secret, encoded) {
  const [algorithm, salt, hex] = (encoded || '').split('$');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hex)) return false;
  const key = await derive(secret, salt, 64, options);
  return timingSafeEqual(key, Buffer.from(hex, 'hex'));
}
// Token aleatório só é entregue na criação; o banco guarda seu SHA-256.
const tokenHash = token => createHash('sha256').update(token).digest('hex');
module.exports = { hashSecret, verifySecret, tokenHash };
