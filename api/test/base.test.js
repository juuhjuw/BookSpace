const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { schemas } = require('../src/middleware/validation');
const { hashSecret, verifySecret, tokenHash } = require('../src/utils/crypto');
const { diaryModel } = require('../src/models/diario.model');
const { contactModel } = require('../src/models/redeApoio.model');

// Testes sem MySQL: verificam segurança/contrato, não substituem integração real.
test('hashes têm salt individual e rejeitam segredo incorreto', async () => {
  const first = await hashSecret('SenhaDeTeste!123');
  const second = await hashSecret('SenhaDeTeste!123');
  assert.notEqual(first, second);
  assert.equal(await verifySecret('SenhaDeTeste!123', first), true);
  assert.equal(await verifySecret('OutraSenha', first), false);
  assert.equal(await verifySecret('1234', 'malformado'), false);
  assert.notEqual(tokenHash('token'), 'token');
});
test('validação rejeita propriedade injetada, PIN numérico e datas impossíveis', () => {
  const body = { categoria: 'Exemplo', descricao: 'Teste', data_ocorrencia: '2026-11-15T12:00:00-03:00' };
  assert.equal(schemas.diary.safeParse(body).success, true);
  assert.equal(schemas.diary.safeParse({ ...body, user_id: 99 }).success, false);
  assert.equal(schemas.diary.safeParse({ ...body, data_ocorrencia: '2026-02-30T12:00:00Z' }).success, false);
  assert.equal(schemas.pin.safeParse({ pin: 1234 }).success, false);
  assert.equal(schemas.pin.safeParse({ pin: '0123' }).success, true);
  assert.equal(schemas.contact.safeParse({ nome_contato: 'Teste', telefone: '+55 00 00000-0000', vinculo: 'Teste', prioridade: 0, alerta_ativo: true }).success, false);
});
test('os dois models incluem user_id em leitura, atualização e exclusão', async () => {
  const calls = [];
  const db = {
    async execute(sql, params) {
      calls.push({ sql, params });
      return sql.startsWith('SELECT') ? [[]] : [{ affectedRows: 0 }];
    },
    async query(sql, params) { calls.push({ sql, params }); return [[]]; },
  };
  for (const factory of [diaryModel, contactModel]) {
    const model = factory(db);
    await model.list(7, { limit: 20, offset: 0 });
    await model.find(7, 123);
    await model.update(7, 123, { categoria: 'Teste', descricao: 'Teste', data_ocorrencia: '2026-11-15 12:00:00', nome_contato: 'Teste', telefone: '00000000', vinculo: 'Teste', prioridade: 1, alerta_ativo: false });
    await model.remove(7, 123);
  }
  for (const call of calls) {
    assert.match(call.sql, /WHERE user_id = \?/);
    assert.ok(call.params.includes(7));
    if (!call.sql.includes('LIMIT')) assert.deepEqual(call.params.slice(-2), [7, 123]);
  }
});
test('HTTP: health, CORS, autenticação, validação, pendências e limite de PIN', async t => {
  let available = true;
  let sqlCalls = 0;
  const db = {
    async query() { if (!available) throw new Error('segredo do banco'); return [[{ ok: 1 }]]; },
    async execute(sql) {
      sqlCalls++;
      if (sql.startsWith('SELECT user_id')) return [[{ user_id: 7 }]];
      return [[]];
    },
  };
  const server = createApp({ db, origins: ['http://localhost:8081'] }).listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, init) => fetch(base + path, init);
  const headers = { authorization: `Bearer ${'a'.repeat(64)}`, 'content-type': 'application/json' };
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/health/ready')).status, 200);
  available = false;
  const ready = await request('/health/ready');
  assert.equal(ready.status, 503);
  assert.equal((await ready.text()).includes('segredo'), false);
  assert.equal((await request('/health', { headers: { origin: 'https://nao-permitida.test' } })).status, 403);
  assert.equal((await request('/perfil')).status, 401);
  assert.equal(sqlCalls, 0);
  assert.equal((await request('/diarios?limit=101', { headers })).status, 400);
  assert.equal((await request('/diarios/0', { headers })).status, 400);
  assert.equal((await request('/diarios/999', { headers })).status, 404);
  assert.equal((await request('/diarios', { method: 'POST', headers, body: '{' })).status, 400);
  assert.equal((await request('/auth/refresh', { method: 'POST' })).status, 501);
  assert.equal((await request('/autoavaliacoes', { headers })).status, 501);
  for (let index = 0; index < 5; index++) {
    assert.equal((await request('/auth/verify-pin', { method: 'POST', headers, body: JSON.stringify({ pin: '1234' }) })).status, 401);
  }
  assert.equal((await request('/auth/verify-pin', { method: 'POST', headers, body: JSON.stringify({ pin: '1234' }) })).status, 429);
});
