const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');

// Opt-in obrigatório e nome exclusivo para evitar usar dados de desenvolvimento.
// Este teste cria/remove somente as contas que ele próprio cadastrou.
const enabled = process.env.RUN_DB_TESTS === 'true';
test('MySQL real: autenticação, CRUDs, isolamento, revogação e cascata', { skip: !enabled }, async t => {
  if (process.env.NODE_ENV !== 'test' || !/^[a-zA-Z0-9_]+_test$/.test(process.env.DB_NAME || '')) {
    throw new Error('Use NODE_ENV=test e DB_NAME terminado em _test.');
  }
  const db = require('../src/config/database');
  const { migrate } = require('../scripts/migrate');
  const { createApp } = require('../src/app');
  let server;
  const users = [];
  // Um único hook ordena encerramento/limpeza e garante fechamento do pool.
  t.after(async () => {
    try {
      if (server) await new Promise(resolve => server.close(resolve));
      for (const user of users) await db.execute('DELETE FROM `User` WHERE id = ?', [user.id]);
    } finally {
      await db.end();
    }
  });
  await migrate();
  server = createApp({ db }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = 'GET', body, token) {
    const response = await fetch(base + path, { method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  }
  const senha = 'SenhaIntegracao!123';
  const id = randomUUID();
  const tokens = [];
  for (let index = 0; index < 2; index++) {
    const email = `teste-${index}-${id}@bookspace.test`;
    const registered = await request('/auth/register', 'POST', { nome: 'Teste', email, senha, pin: '4826' });
    assert.equal(registered.status, 201);
    assert.equal('senha_hash' in registered.body, false);
    assert.equal('pin_hash' in registered.body, false);
    users.push(registered.body);
    const login = await request('/auth/login', 'POST', { email, senha });
    assert.equal(login.status, 200);
    tokens.push(login.body.token);
  }
  const [a, b] = tokens;
  const wrong = await request('/auth/login', 'POST', { email: users[0].email, senha: 'incorreta' });
  const absent = await request('/auth/login', 'POST', { email: 'ausente@bookspace.test', senha: 'incorreta' });
  assert.deepEqual(wrong, absent);
  assert.equal((await request('/auth/verify-pin', 'POST', { pin: '4826' }, a)).status, 200);
  assert.equal((await request('/auth/pin', 'PUT', { senha, pin: '1593' }, a)).status, 204);
  assert.equal((await request('/auth/verify-pin', 'POST', { pin: '4826' }, a)).status, 401);
  assert.equal((await request('/auth/verify-pin', 'POST', { pin: '1593' }, a)).status, 200);
  const bodies = {
    '/diarios': { categoria: 'Exemplo', descricao: 'Fictício', data_ocorrencia: '2026-11-15T12:00:00Z' },
    '/rede-apoio': { nome_contato: 'Exemplo', telefone: '0000000000', vinculo: 'Teste', prioridade: 1, alerta_ativo: false },
  };
  for (const [path, body] of Object.entries(bodies)) {
    const created = await request(path, 'POST', body, a);
    assert.equal(created.status, 201);
    const itemPath = `${path}/${created.body.id}`;
    assert.equal((await request(itemPath, 'GET', null, b)).status, 404);
    assert.equal((await request(itemPath, 'PUT', body, b)).status, 404);
    assert.equal((await request(itemPath, 'DELETE', null, b)).status, 404);
    assert.equal((await request(path, 'GET', null, b)).body.data.length, 0);
    assert.equal((await request(itemPath, 'PUT', { ...body, ...(path === '/diarios' ? { descricao: 'Alterado' } : { alerta_ativo: true }) }, a)).status, 200);
    assert.equal((await request(itemPath, 'DELETE', null, a)).status, 204);
    // Mantém um novo registro para verificar exclusão em cascata abaixo.
    assert.equal((await request(path, 'POST', body, a)).status, 201);
  }
  assert.deepEqual((await request('/dashboard/resumo', 'GET', null, a)).body, { totalDiarios: 1, totalContatos: 1, ultimoNivelRisco: null });
  assert.equal((await request('/perfil', 'PUT', { nome: 'Novo nome' }, a)).body.nome, 'Novo nome');
  assert.equal((await request('/perfil', 'DELETE', { senha }, a)).status, 204);
  assert.equal((await request('/perfil', 'GET', null, a)).status, 401);
  for (const table of ['Diario', 'Rede_Apoio', 'Autoavaliacao', 'Sessoes']) {
    const [[row]] = await db.execute(`SELECT COUNT(*) AS total FROM ${table} WHERE user_id = ?`, [users[0].id]);
    assert.equal(row.total, 0);
  }
  assert.equal((await request('/auth/logout', 'POST', null, b)).status, 204);
  assert.equal((await request('/perfil', 'GET', null, b)).status, 401);
});
