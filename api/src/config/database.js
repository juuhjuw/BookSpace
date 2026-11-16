const mysql = require('mysql2/promise');
const env = require('./env');

// Consultas usam parâmetros; múltiplas instruções ficam desabilitadas na API.
const pool = mysql.createPool({
  host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
  password: env.DB_PASSWORD, database: env.DB_NAME,
  waitForConnections: true, connectionLimit: 10, queueLimit: 50,
  timezone: 'Z', charset: 'utf8mb4', dateStrings: true,
});
// Também fixa o fuso da sessão SQL: timezone do driver só controla serialização.
pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'");
});
// TODO: configurar TLS com CA do provedor quando houver banco remoto.
module.exports = pool;
