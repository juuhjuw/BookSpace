const db = require('./src/config/database');

async function testarConexao() {
    try {
        const [resultado] = await db.query('SELECT 1 AS teste');
        console.log('Conexão com MySQL realizada com sucesso!');
        console.log(resultado);
    } catch (erro) {
        console.error('Erro ao conectar:', erro.message);
    } finally {
        await db.end();
    }
}

testarConexao();