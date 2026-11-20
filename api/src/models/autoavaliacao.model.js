
const db = require('../config/database');

// Listar todas as autoavaliações de um usuário
async function listar(userId) {
    const [resultados] = await db.query(
        'SELECT * FROM Autoavaliacao WHERE user_id = ? ORDER BY data_avaliacao DESC',
        [userId]
    );

    return resultados;
}

// Buscar uma autoavaliação pelo ID
async function buscarPorId(id, userId) {
    const [resultados] = await db.query(
        'SELECT * FROM Autoavaliacao WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    return resultados[0] || null;
}

// Criar uma nova autoavaliação
async function criar(userId, pontuacaoTotal, nivelRisco, respostas) {
    const [resultado] = await db.query(
        `INSERT INTO Autoavaliacao
        (user_id, pontuacao_total, nivel_risco, respostas_json)
        VALUES (?, ?, ?, ?)`,
        [userId, pontuacaoTotal, nivelRisco, JSON.stringify(respostas)]
    );

    return resultado.insertId;
}

// Atualizar uma autoavaliação
async function atualizar(id, userId, pontuacaoTotal, nivelRisco, respostas) {
    const [resultado] = await db.query(
        `UPDATE Autoavaliacao
         SET pontuacao_total = ?, nivel_risco = ?, respostas_json = ?
         WHERE id = ? AND user_id = ?`,
        [pontuacaoTotal, nivelRisco, JSON.stringify(respostas), id, userId]
    );

    return resultado.affectedRows > 0;
}

// Excluir uma autoavaliação
async function excluir(id, userId) {
    const [resultado] = await db.query(
        'DELETE FROM Autoavaliacao WHERE id = ? AND user_id = ?',
        [id, userId]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir
};
