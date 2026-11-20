const Diario = require('../models/diario.model');

function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function camposValidos({ user_id, titulo, descricao, data_ocorrencia }) {
  const dataValida = data_ocorrencia === undefined || data_ocorrencia === null ||
    (typeof data_ocorrencia === 'string' && !Number.isNaN(Date.parse(data_ocorrencia)));
  return idValido(user_id) !== null &&
    typeof titulo === 'string' && titulo.trim().length > 0 && titulo.trim().length <= 150 &&
    typeof descricao === 'string' && descricao.trim().length > 0 && descricao.length <= 10000 &&
    dataValida;
}

async function listar(req, res) {
  const userId = idValido(req.query.user_id);
  if (!userId) return res.status(400).json({ erro: 'ID do usuário inválido.' });

  try {
    return res.status(200).json(await Diario.listar(userId));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar registros.' });
  }
}

async function buscarPorId(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const diario = await Diario.buscarPorId(id, userId);
    if (!diario) return res.status(404).json({ erro: 'Registro não encontrado.' });
    return res.status(200).json(diario);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar registro.' });
  }
}

async function criar(req, res) {
  const { user_id, titulo, descricao, data_ocorrencia } = req.body;
  if (!camposValidos({ user_id, titulo, descricao, data_ocorrencia })) {
    return res.status(400).json({ erro: 'Dados do registro inválidos.' });
  }

  try {
    const id = await Diario.criar(
      idValido(user_id),
      titulo.trim(),
      descricao.trim(),
      data_ocorrencia ? new Date(data_ocorrencia) : null,
    );
    return res.status(201).json({ id });
  } catch (erro) {
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ erro: 'Usuário não encontrado.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar registro.' });
  }
}

async function atualizar(req, res) {
  const id = idValido(req.params.id);
  const { user_id, titulo, descricao, data_ocorrencia } = req.body || {};
  if (!id || !camposValidos({ user_id, titulo, descricao, data_ocorrencia })) {
    return res.status(400).json({ erro: 'Dados do registro inválidos.' });
  }

  try {
    const atualizado = await Diario.atualizar(
      id,
      idValido(user_id),
      titulo.trim(),
      descricao.trim(),
      data_ocorrencia ? new Date(data_ocorrencia) : null,
    );
    if (!atualizado) return res.status(404).json({ erro: 'Registro não encontrado.' });
    return res.status(200).json({ mensagem: 'Registro atualizado.' });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar registro.' });
  }
}

async function excluir(req, res) {
  const id = idValido(req.params.id);
  const userId = idValido(req.query.user_id);
  if (!id || !userId) return res.status(400).json({ erro: 'ID inválido.' });

  try {
    const excluido = await Diario.excluir(id, userId);
    if (!excluido) return res.status(404).json({ erro: 'Registro não encontrado.' });
    return res.status(204).end();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir registro.' });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };