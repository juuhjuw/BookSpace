// Projeção pública explícita: novos campos privados não vazam por SELECT *.
const PUBLIC_FIELDS = 'id, nome, email, criado_em, atualizado_em';
function profileModel(db) {
  return {
    async find(id) {
      const [rows] = await db.execute(`SELECT ${PUBLIC_FIELDS} FROM \`User\` WHERE id = ?`, [id]);
      return rows[0];
    },
    async credentials(email) {
      const [rows] = await db.execute('SELECT id, senha_hash FROM `User` WHERE email = ?', [email]);
      return rows[0];
    },
    async secrets(id) {
      const [rows] = await db.execute('SELECT senha_hash, pin_hash FROM `User` WHERE id = ?', [id]);
      return rows[0];
    },
    async create({ nome, email, senhaHash, pinHash }) {
      const [result] = await db.execute('INSERT INTO `User` (nome,email,senha_hash,pin_hash) VALUES (?,?,?,?)',
        [nome, email, senhaHash, pinHash]);
      return this.find(result.insertId);
    },
    async update(id, nome) {
      await db.execute('UPDATE `User` SET nome = ? WHERE id = ?', [nome, id]);
      return this.find(id);
    },
    async remove(id) {
      // InnoDB remove sessões e registros vinculados pela FK ON DELETE CASCADE.
      await db.execute('DELETE FROM `User` WHERE id = ?', [id]);
    },
    async changePin(id, hash) {
      await db.execute('UPDATE `User` SET pin_hash = ? WHERE id = ?', [hash, id]);
    },
  };
}
module.exports = { profileModel };
