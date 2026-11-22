
const db = require('../config/database');

async function listar(userId) {
    const [resultados] = await db.query(
        'SELECT id, user_id, respostas_json, data_avaliacao FROM Autoavaliacao WHERE user_id = ? ORDER BY data_avaliacao DESC',
        [userId]
    );
    return resultados;
}

async function buscarPorId(id, userId) {
    const [resultados] = await db.query(
        'SELECT id, user_id, respostas_json, data_avaliacao FROM Autoavaliacao WHERE id = ? AND user_id = ?',
        [id, userId]
    );
    return resultados[0] || null;
}

async function criar(userId, respostas) {
    const [resultado] = await db.query(
        'INSERT INTO Autoavaliacao (user_id, respostas_json) VALUES (?, ?)',
        [userId, JSON.stringify(respostas)]
    );
    return resultado.insertId;
}

async function atualizar(id, userId, respostas) {
    const [resultado] = await db.query(
        'UPDATE Autoavaliacao SET respostas_json = ? WHERE id = ? AND user_id = ?',
        [JSON.stringify(respostas), id, userId]
    );
    return resultado.affectedRows > 0;
}

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
