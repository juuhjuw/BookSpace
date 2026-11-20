const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

const app = require('../src/app');
const Perfil = require('../src/models/perfil.model');
const Diario = require('../src/models/diario.model');
const RedeApoio = require('../src/models/redeApoio.model');
const Autoavaliacao = require('../src/models/autoavaliacao.model');

function guardarMetodos(model) {
  return Object.fromEntries(
    Object.keys(model).map((chave) => [chave, model[chave]]),
  );
}

function criarRepositorioEmMemoria(model, { perfil = false } = {}) {
  let proximoId = perfil ? 1 : 1;
  const registros = new Map();

  model.listar = async (userId) => Array.from(registros.values())
    .filter((registro) => perfil || registro.user_id === userId);
  model.buscarPorId = async (id, userId) => {
    const registro = registros.get(id);
    return registro && (perfil || registro.user_id === userId) ? registro : null;
  };
  if (perfil) {
    model.buscarPorEmail = async (email) =>
      Array.from(registros.values()).find((registro) => registro.email === email) || null;
    model.criar = async (nome, email, pinHash) => {
      if (Array.from(registros.values()).some((registro) => registro.email === email)) {
        const erro = new Error('E-mail duplicado');
        erro.code = 'ER_DUP_ENTRY';
        throw erro;
      }
      const id = proximoId++;
      registros.set(id, { id, nome, email, pin_seguranca: pinHash });
      return id;
    };
    model.atualizar = async (id, nome, email, pinHash) => {
      const registro = registros.get(id);
      if (!registro) return false;
      Object.assign(registro, { nome, email });
      if (pinHash) registro.pin_seguranca = pinHash;
      return true;
    };
    model.excluir = async (id) => registros.delete(id);
  } else {
    model.criar = async (userId, ...campos) => {
      if (userId !== 1) {
        const erro = new Error('Usuário não encontrado');
        erro.code = 'ER_NO_REFERENCED_ROW_2';
        throw erro;
      }
      const id = proximoId++;
      const registro = { id, user_id: userId };
      if (model === Diario) {
        Object.assign(registro, {
          titulo: campos[0],
          descricao: campos[1],
          data_ocorrencia: campos[2],
          criado_em: new Date().toISOString(),
        });
      } else if (model === RedeApoio) {
        Object.assign(registro, {
          nome_contato: campos[0],
          telefone: campos[1],
          prioridade: campos[2],
        });
      } else {
        Object.assign(registro, {
          respostas_json: JSON.stringify(campos[0]),
          respostas: campos[0],
          data_avaliacao: new Date().toISOString(),
        });
      }
      registros.set(id, registro);
      return id;
    };
    model.atualizar = async (id, userId, ...campos) => {
      const registro = registros.get(id);
      if (!registro || registro.user_id !== userId) return false;
      if (model === Diario) {
        Object.assign(registro, {
          titulo: campos[0],
          descricao: campos[1],
          data_ocorrencia: campos[2],
        });
      } else if (model === RedeApoio) {
        Object.assign(registro, {
          nome_contato: campos[0],
          telefone: campos[1],
          prioridade: campos[2],
        });
      } else {
        registro.respostas_json = JSON.stringify(campos[0]);
        registro.respostas = campos[0];
      }
      return true;
    };
    model.excluir = async (id, userId) => {
      const registro = registros.get(id);
      return !!registro && registro.user_id === userId && registros.delete(id);
    };
  }

  return () => {
    for (const chave of Object.keys(model)) delete model[chave];
    Object.assign(model, originals.get(model));
  };
}

const originals = new Map(
  [Perfil, Diario, RedeApoio, Autoavaliacao].map((model) => [model, guardarMetodos(model)]),
);

test('REST routes validate requests and perform CRUDs for linked records', async (t) => {
  const restaurar = [
    criarRepositorioEmMemoria(Perfil, { perfil: true }),
    criarRepositorioEmMemoria(Diario),
    criarRepositorioEmMemoria(RedeApoio),
    criarRepositorioEmMemoria(Autoavaliacao),
  ];
  t.after(() => restaurar.forEach((fn) => fn()));

  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  let token = '';

  const preflight = await fetch(`${base}/diarios`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:8081',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization',
    },
  });
  assert.equal(preflight.status, 204);
  assert.match(preflight.headers.get('access-control-allow-headers'), /authorization/i);

  async function requisicao(path, method = 'GET', body, autenticada = true) {
    const resposta = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(autenticada && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const dados = resposta.status === 204 ? null : await resposta.json();
    return { resposta, dados };
  }

  const cadastro = await requisicao('/usuarios', 'POST', {
    nome: 'Pessoa de teste',
    email: 'teste@example.com',
    pin: '1234',
  });
  assert.equal(cadastro.resposta.status, 201);
  assert.equal(cadastro.dados.usuario.id, 1);
  assert.equal('pin_seguranca' in cadastro.dados.usuario, false);
  token = cadastro.dados.token;
  assert.equal((await requisicao('/usuarios', 'POST', {
    nome: 'Perfil duplicado',
    email: 'teste@example.com',
    pin: '4321',
  }, false)).resposta.status, 409);

  assert.equal((await requisicao('/diarios?user_id=1', 'GET', undefined, false)).resposta.status, 401);

  assert.equal((await requisicao('/usuarios/login', 'POST', {
    email: 'teste@example.com',
    pin: '0000',
  }, false)).resposta.status, 401);
  const login = await requisicao('/usuarios/login', 'POST', {
    email: 'teste@example.com',
    pin: '1234',
  }, false);
  assert.equal(login.resposta.status, 200);
  token = login.dados.token;
  assert.equal((await requisicao('/usuarios/1')).resposta.status, 200);
  const listaPerfis = await requisicao('/usuarios');
  assert.equal(listaPerfis.resposta.status, 200);
  assert.equal(listaPerfis.dados.length, 1);
  assert.equal((await requisicao('/usuarios/abc')).resposta.status, 400);
  assert.equal((await requisicao('/usuarios', 'POST')).resposta.status, 400);
  const perfilAtualizado = await requisicao('/usuarios/1', 'PUT', {
    nome: 'Perfil atualizado',
    email: 'novo@example.com',
    pin: '5678',
  });
  assert.equal(perfilAtualizado.resposta.status, 200);
  assert.equal(perfilAtualizado.dados.nome, 'Perfil atualizado');
  assert.equal('pin_seguranca' in perfilAtualizado.dados, false);
  assert.equal((await requisicao('/usuarios/login', 'POST', {
    email: 'teste@example.com',
    pin: '1234',
  }, false)).resposta.status, 401);
  const novoLogin = await requisicao('/usuarios/login', 'POST', {
    email: 'novo@example.com',
    pin: '5678',
  }, false);
  assert.equal(novoLogin.resposta.status, 200);
  token = novoLogin.dados.token;

  const casos = [
    {
      rota: '/diarios',
      corpo: {
        user_id: 1,
        titulo: 'Relato',
        descricao: 'Descrição de teste',
        data_ocorrencia: '2026-11-20T12:00:00.000Z',
      },
      atualizado: {
        user_id: 1,
        titulo: 'Relato atualizado',
        descricao: 'Descrição atualizada',
        data_ocorrencia: '2026-11-20T13:00:00.000Z',
      },
    },
    {
      rota: '/rede-apoio',
      corpo: { user_id: 1, nome_contato: 'Contato', telefone: '+5511999999999', prioridade: 2 },
      atualizado: { user_id: 1, nome_contato: 'Contato editado', telefone: '+5511888888888', prioridade: 1 },
    },
    {
      rota: '/autoavaliacoes',
      corpo: { user_id: 1, respostas: { pergunta1: true, pergunta2: false } },
      atualizado: { user_id: 1, respostas: { pergunta1: false, pergunta2: true } },
    },
  ];

  for (const caso of casos) {
    const criado = await requisicao(caso.rota, 'POST', caso.corpo);
    assert.equal(criado.resposta.status, 201, caso.rota);
    const id = criado.dados.id;
    assert.equal((await requisicao(`${caso.rota}?user_id=1`)).resposta.status, 200);
    assert.equal((await requisicao(`${caso.rota}/${id}?user_id=1`)).resposta.status, 200);
    assert.equal((await requisicao(`${caso.rota}/${id}`, 'PUT', caso.atualizado)).resposta.status, 200);
    assert.equal((await requisicao(`${caso.rota}/${id}?user_id=1`, 'DELETE')).resposta.status, 204);
    assert.equal((await requisicao(`${caso.rota}/${id}?user_id=1`)).resposta.status, 404);
  }

  assert.equal((await requisicao('/diarios', 'POST', {
    user_id: 999,
    titulo: 'Relato',
    descricao: 'Registro sem usuário',
  })).resposta.status, 404);
  assert.equal((await requisicao('/diarios', 'POST', {
    titulo: 'Relato',
    descricao: 'Sem usuário informado',
  })).resposta.status, 400);
  assert.equal((await requisicao('/diarios?user_id=2')).resposta.status, 404);
  const contexto = await requisicao('/modelo/contexto');
  assert.equal(contexto.resposta.status, 200);
  assert.equal(contexto.dados.amostra.notificacoesComAlvoConhecido, 89988);
  assert.match(contexto.dados.aviso, /Não avalia uma pessoa/);
  assert.equal((await requisicao('/modelo/prever', 'POST', {})).resposta.status, 404);

  assert.equal((await requisicao('/usuarios/1', 'DELETE')).resposta.status, 204);
  assert.equal((await requisicao('/usuarios', 'GET')).resposta.status, 401);
});
