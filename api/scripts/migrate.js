const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const pool = require('../src/config/database');

// DDL do MySQL faz commit implícito. Não prometemos rollback de migration parcial.
// Arquivos aplicados são imutáveis: novas mudanças devem gerar novas migrations.
async function migrate() {
  const connection = await pool.getConnection();
  let locked = false;
  try {
    const [[row]] = await connection.query("SELECT GET_LOCK('bookspace_migrations', 15) AS acquired");
    if (row.acquired !== 1) throw new Error('Outra migration está em andamento.');
    locked = true;
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(100) PRIMARY KEY, checksum CHAR(64) NOT NULL,
      aplicado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);
    const [applied] = await connection.query('SELECT version, checksum FROM schema_migrations');
    const versions = new Map(applied.map(row => [row.version, row.checksum]));
    const directory = path.resolve(__dirname, '../database/migrations');
    const files = (await fs.readdir(directory)).filter(file => /^\d+_.*\.sql$/.test(file)).sort();
    if (!applied.length) {
      const [existing] = await connection.query(`SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('User','Diario','Rede_Apoio','Autoavaliacao','Sessoes')`);
      if (existing.length) throw new Error('Banco contém tabelas sem histórico. Use banco novo ou prepare conversão com backup; veja README.');
    }
    for (const file of files) {
      const sql = await fs.readFile(path.join(directory, file), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      if (versions.has(file)) {
        if (versions.get(file) !== checksum) throw new Error(`Migration alterada após aplicação: ${file}`);
        continue;
      }
      // Runner intencionalmente simples: SQL sem procedures/delimiters e sem ponto
      // e vírgula dentro de strings. TODO: adotar ferramenta dedicada se necessário.
      const statements = sql.replace(/^\s*--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) await connection.query(statement);
      await connection.execute('INSERT INTO schema_migrations (version, checksum) VALUES (?, ?)', [file, checksum]);
      console.log(`Migration aplicada: ${file}`);
    }
    console.log('Banco atualizado.');
  } finally {
    if (locked) await connection.query("SELECT RELEASE_LOCK('bookspace_migrations')");
    connection.release();
  }
}
// Não imprime objetos de erro do driver, que podem incluir SQL e dados sensíveis.
if (require.main === module) migrate().catch(error => {
  console.error(error.code ? `Falha na migration (${error.code}). Verifique conexão e schema.` : error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
module.exports = { migrate };
