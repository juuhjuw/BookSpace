const env = require('../src/config/env');
const pool = require('../src/config/database');
const { schemas } = require('../src/middleware/validation');
const { hashSecret } = require('../src/utils/crypto');

// Seed opt-in de desenvolvimento: dados fictícios, transação e nenhuma limpeza.
// Reexecução mantém a conta e seus dados existentes sem trocar senha ou PIN.
async function seed() {
  if (env.NODE_ENV !== 'development' || process.env.ALLOW_DEV_SEED !== 'true') {
    throw new Error('Seed bloqueada. Exige NODE_ENV=development e ALLOW_DEV_SEED=true.');
  }
  const input = schemas.register.parse({ nome: 'Pessoa de demonstração',
    email: process.env.SEED_EMAIL, senha: process.env.SEED_PASSWORD, pin: process.env.SEED_PIN });
  const senhaHash = await hashSecret(input.senha);
  const pinHash = await hashSecret(input.pin);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute('SELECT id FROM `User` WHERE email = ?', [input.email]);
    if (existing.length) {
      await connection.rollback();
      console.log('Conta da seed já existe. Nenhum dado foi alterado.');
      return;
    }
    const [user] = await connection.execute('INSERT INTO `User` (nome,email,senha_hash,pin_hash) VALUES (?,?,?,?)',
      [input.nome, input.email, senhaHash, pinHash]);
    await connection.execute(`INSERT INTO Diario (user_id,categoria,descricao,data_ocorrencia)
      VALUES (?,?,?,UTC_TIMESTAMP())`, [user.insertId, 'Exemplo acadêmico', 'Registro fictício para testar o diário.']);
    await connection.execute(`INSERT INTO Rede_Apoio (user_id,nome_contato,telefone,vinculo,prioridade,alerta_ativo)
      VALUES (?,?,?,?,?,?)`, [user.insertId, 'Contato fictício', '+55 00 00000-0000', 'Exemplo', 1, false]);
    // Autoavaliações ficam vazias até existir uma regra aprovada e versionada.
    await connection.commit();
    console.log('Seed criada. Credenciais são as definidas em SEED_EMAIL/SEED_PASSWORD/SEED_PIN no .env.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
if (require.main === module) seed().catch(() => {
  console.error('Falha na seed. Confira o opt-in, credenciais de demonstração e migrations.');
  process.exitCode = 1;
}).finally(() => pool.end());
module.exports = { seed };
