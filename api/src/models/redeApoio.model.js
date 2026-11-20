const db = require('../config/database');

async function listar(userId) {
  const [contatos] = await db.query(
    'SELECT id, user_id, nome_contato, telefone, prioridade FROM Rede_Apoio WHERE user_id = ? ORDER BY prioridade, id',
    [userId],
  );
  return contatos;
}

async function buscarPorId(id, userId) {
  const [contatos] = await db.query(
    'SELECT id, user_id, nome_contato, telefone, prioridade FROM Rede_Apoio WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return contatos[0] || null;
}

async function criar(userId, nome, telefone, prioridade) {
  const [resultado] = await db.query(
    'INSERT INTO Rede_Apoio (user_id, nome_contato, telefone, prioridade) VALUES (?, ?, ?, ?)',
    [userId, nome, telefone, prioridade],
  );
  return resultado.insertId;
}

async function atualizar(id, userId, nome, telefone, prioridade) {
  const [resultado] = await db.query(
    'UPDATE Rede_Apoio SET nome_contato = ?, telefone = ?, prioridade = ? WHERE id = ? AND user_id = ?',
    [nome, telefone, prioridade, id, userId],
  );
  return resultado.affectedRows > 0;
}

async function excluir(id, userId) {
  const [resultado] = await db.query(
    'DELETE FROM Rede_Apoio WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };