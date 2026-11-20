const db = require('../config/database');

async function listar(userId) {
  const [registros] = await db.query(
    'SELECT id, user_id, titulo, descricao, data_ocorrencia, criado_em FROM Diario WHERE user_id = ? ORDER BY data_ocorrencia DESC, id DESC',
    [userId],
  );
  return registros;
}

async function buscarPorId(id, userId) {
  const [registros] = await db.query(
    'SELECT id, user_id, titulo, descricao, data_ocorrencia, criado_em FROM Diario WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return registros[0] || null;
}

async function criar(userId, titulo, descricao, dataOcorrencia) {
  const [resultado] = await db.query(
    'INSERT INTO Diario (user_id, titulo, descricao, data_ocorrencia) VALUES (?, ?, ?, ?)',
    [userId, titulo, descricao, dataOcorrencia],
  );
  return resultado.insertId;
}

async function atualizar(id, userId, titulo, descricao, dataOcorrencia) {
  const [resultado] = await db.query(
    'UPDATE Diario SET titulo = ?, descricao = ?, data_ocorrencia = ? WHERE id = ? AND user_id = ?',
    [titulo, descricao, dataOcorrencia, id, userId],
  );
  return resultado.affectedRows > 0;
}

async function excluir(id, userId) {
  const [resultado] = await db.query(
    'DELETE FROM Diario WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };