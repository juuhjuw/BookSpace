const db = require('../config/database');

async function buscarPorId(id) {
  const [perfis] = await db.query(
    'SELECT id, nome, email, pin_seguranca, criado_em FROM `User` WHERE id = ?',
    [id],
  );
  return perfis[0] || null;
}

async function buscarPorEmail(email) {
  const [perfis] = await db.query(
    'SELECT id, nome, email, pin_seguranca, criado_em FROM `User` WHERE email = ?',
    [email],
  );
  return perfis[0] || null;
}

async function criar(nome, email, pinHash) {
  const [resultado] = await db.query(
    'INSERT INTO `User` (nome, email, senha, pin_seguranca) VALUES (?, ?, ?, ?)',
    [nome, email, '', pinHash],
  );
  return resultado.insertId;
}

async function atualizar(id, nome, email, pinHash) {
  const [resultado] = await db.query(
    `UPDATE \`User\`
     SET nome = ?, email = ?, pin_seguranca = COALESCE(?, pin_seguranca)
     WHERE id = ?`,
    [nome, email, pinHash, id],
  );
  return resultado.affectedRows > 0;
}

async function excluir(id) {
  const [resultado] = await db.query('DELETE FROM `User` WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { buscarPorId, buscarPorEmail, criar, atualizar, excluir };