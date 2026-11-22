const RedeApoio = require('../models/redeApoio.model');

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function dadosValidos({ user_id, nome_contato, telefone, prioridade }) {
  const prioridadeValida = prioridade === undefined ||
    (Number.isInteger(prioridade) && prioridade >= 1 && prioridade <= 5);
  return idValido(user_id) !== null &&
    typeof nome_contato === 'string' && nome_contato.trim().length > 0 &&
    nome_contato.trim().length <= 100 &&
    typeof telefone === 'string' && /^[+\d][\d ()-]{5,19}$/.test(telefone.trim()) &&
    prioridadeValida;
}

async function listar(req, res) {
  const userId = idValido(req.query.user_id);
  if (!userId) return res.status(400).json({ erro: 'ID do usuário inválido.' });

  try {
    return res.status(200).json(await RedeApoio.listar(userId));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar contatos.' });
  }
}

async function buscarPorId(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const contato = await RedeApoio.buscarPorId(id, userId);
    if (!contato) return res.status(404).json({ erro: 'Contato não encontrado.' });
    return res.status(200).json(contato);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar contato.' });
  }
}

async function criar(req, res) {
  const { user_id, nome_contato, telefone, prioridade } = req.body || {};
  if (!dadosValidos({ user_id, nome_contato, telefone, prioridade })) {
    return res.status(400).json({ erro: 'Dados do contato inválidos.' });
  }

  try {
    const id = await RedeApoio.criar(
      idValido(user_id), nome_contato.trim(), telefone.trim(), prioridade || 1,
    );
    return res.status(201).json({ id });
  } catch (erro) {
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Usuário não encontrado.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar contato.' });
  }
}

async function atualizar(req, res) {
  const id = idValido(req.params.id);
  const { user_id, nome_contato, telefone, prioridade } = req.body || {};
  if (!id || !dadosValidos({ user_id, nome_contato, telefone, prioridade })) {
    return res.status(400).json({ erro: 'Dados do contato inválidos.' });
  }

  try {
    const atualizado = await RedeApoio.atualizar(
      id, idValido(user_id), nome_contato.trim(), telefone.trim(), prioridade || 1,
    );
    if (!atualizado) return res.status(404).json({ erro: 'Contato não encontrado.' });
    return res.status(200).json({ mensagem: 'Contato atualizado.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar contato.' });
  }
}

async function excluir(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const excluido = await RedeApoio.excluir(id, userId);
    if (!excluido) return res.status(404).json({ erro: 'Contato não encontrado.' });
    return res.status(204).end();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir contato.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };