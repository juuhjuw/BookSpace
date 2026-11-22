
const Autoavaliacao = require('../models/autoavaliacao.model');

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function respostasValidas(respostas) {
  return respostas && typeof respostas === 'object' && !Array.isArray(respostas) &&
    Object.keys(respostas).length > 0 &&
    Object.values(respostas).every((valor) => typeof valor === 'boolean');
}

function preparar(avaliacao) {
  return {
    ...avaliacao,
    respostas: typeof avaliacao.respostas_json === 'string'
      ? JSON.parse(avaliacao.respostas_json)
      : avaliacao.respostas_json,
  };
}

async function listar(req, res) {
  const userId = idValido(req.query.user_id);
  if (!userId) return res.status(400).json({ erro: 'ID do usuário inválido.' });

  try {
    return res.status(200).json((await Autoavaliacao.listar(userId)).map(preparar));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar autoavaliações.' });
  }
}

async function buscarPorId(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const avaliacao = await Autoavaliacao.buscarPorId(id, userId);
    if (!avaliacao) return res.status(404).json({ erro: 'Autoavaliação não encontrada.' });
    return res.status(200).json(preparar(avaliacao));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar autoavaliação.' });
  }
}

async function criar(req, res) {
  const corpo = req.body || {};
  const userId = idValido(corpo.user_id);
  const { respostas } = corpo;
  if (!userId || !respostasValidas(respostas)) {
    return res.status(400).json({ erro: 'Informe um usuário e as respostas booleanas.' });
  }

  try {
    const id = await Autoavaliacao.criar(userId, respostas);
    return res.status(201).json({ id });
  } catch (erro) {
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Usuário não encontrado.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao salvar autoavaliação.' });
  }
}

async function atualizar(req, res) {
  const id = idValido(req.params.id);
  const corpo = req.body || {};
  const userId = idValido(corpo.user_id);
  const { respostas } = corpo;
  if (!id || !userId || !respostasValidas(respostas)) {
    return res.status(400).json({ erro: 'Dados da autoavaliação inválidos.' });
  }

  try {
    const atualizado = await Autoavaliacao.atualizar(id, userId, respostas);
    if (!atualizado) return res.status(404).json({ erro: 'Autoavaliação não encontrada.' });
    return res.status(200).json({ mensagem: 'Autoavaliação atualizada.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar autoavaliação.' });
  }
}

async function excluir(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const excluido = await Autoavaliacao.excluir(id, userId);
    if (!excluido) return res.status(404).json({ erro: 'Autoavaliação não encontrada.' });
    return res.status(204).end();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir autoavaliação.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
