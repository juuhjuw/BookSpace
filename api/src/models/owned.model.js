// Factory interna para os dois CRUDs com a mesma regra de propriedade.
// table/fields/order são constantes do código, nunca vêm de parâmetros HTTP.
function ownedModel(db, { table, fields, order, normalize = row => row }) {
  const projection = ['id', ...fields, 'criado_em', 'atualizado_em'].join(', ');
  return {
    async list(userId, { limit, offset }) {
      // query formata limites numéricos já validados, evitando diferenças do LIMIT
      // em prepared statements entre versões do servidor MySQL.
      const [rows] = await db.query(`SELECT ${projection} FROM ${table} WHERE user_id = ? ORDER BY ${order} LIMIT ? OFFSET ?`, [userId, limit, offset]);
      return rows.map(normalize);
    },
    async find(userId, id) {
      const [rows] = await db.execute(`SELECT ${projection} FROM ${table} WHERE user_id = ? AND id = ?`, [userId, id]);
      return rows[0] ? normalize(rows[0]) : undefined;
    },
    async create(userId, body) {
      const values = fields.map(field => body[field]);
      const [result] = await db.execute(`INSERT INTO ${table} (user_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})`, [userId, ...values]);
      return this.find(userId, result.insertId);
    },
    async update(userId, id, body) {
      // O filtro de propriedade também está na escrita, não apenas na leitura.
      const [result] = await db.execute(`UPDATE ${table} SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE user_id = ? AND id = ?`, [...fields.map(field => body[field]), userId, id]);
      if (!result.affectedRows) return undefined;
      return this.find(userId, id);
    },
    async remove(userId, id) {
      const [result] = await db.execute(`DELETE FROM ${table} WHERE user_id = ? AND id = ?`, [userId, id]);
      return result.affectedRows > 0;
    },
  };
}
module.exports = { ownedModel };
