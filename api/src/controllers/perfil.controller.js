const crypto = require('crypto');
const Perfil = require('../models/perfil.model');
const { criarSessao, removerSessoes } = require('../middleware/auth');

const EMAIL_VALIDO = /^\S+@\S+\.\S+$/;

function pinValido(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pin, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verificarPin(pin, hashArmazenado) {
  if (typeof hashArmazenado !== 'string') return false;
  const [algoritmo, salt, hashHex] = hashArmazenado.split('$');
  if (algoritmo !== 'scrypt' || !salt || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  if (esperado.length !== 64 || !/^[\da-f]{128}$/i.test(hashHex)) return false;
  const calculado = crypto.scryptSync(pin, salt, esperado.length);
  return esperado.length === calculado.length &&
    crypto.timingSafeEqual(esperado, calculado);
}

function perfilPublico(perfil) {
  if (!perfil) return null;
  return {
    id: perfil.id,
    nome: perfil.nome,
    email: perfil.email,
    criado_em: perfil.criado_em,
  };
}

function dadosValidos({ nome, email, pin }, exigirPin) {
  return typeof nome === 'string' && nome.trim().length > 0 &&
    nome.trim().length <= 100 &&
    typeof email === 'string' && EMAIL_VALIDO.test(email.trim()) &&
    email.trim().length <= 150 &&
    (!exigirPin || pinValido(pin));
}

async function listar(req, res) {
  try {
    const perfil = await Perfil.buscarPorId(req.userId);
    if (!perfil) return res.status(404).json({ erro: 'Perfil não encontrado.' });
    return res.status(200).json([perfilPublico(perfil)]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao listar perfis.' });
  }
}

async function buscarPorId(req, res) {
  const id = req.userId;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID do perfil inválido.' });
  }

  try {
    const perfil = await Perfil.buscarPorId(id);
    if (!perfil) return res.status(404).json({ erro: 'Perfil não encontrado.' });
    return res.status(200).json(perfilPublico(perfil));
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao buscar perfil.' });
  }
}

async function criar(req, res) {
  const { nome, email, pin } = req.body || {};
  if (!dadosValidos({ nome, email, pin }, true)) {
    return res.status(400).json({ erro: 'Informe nome, e-mail válido e PIN de quatro dígitos.' });
  }

  try {
    const id = await Perfil.criar(nome.trim(), email.trim().toLowerCase(), hashPin(pin));
    const perfil = perfilPublico(await Perfil.buscarPorId(id));
    return res.status(201).json({ usuario: perfil, token: criarSessao(id) });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um perfil com este e-mail.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao criar perfil.' });
  }
}

async function autenticar(req, res) {
  const { email, pin } = req.body || {};
  if (typeof email !== 'string' || !EMAIL_VALIDO.test(email.trim()) || !pinValido(pin)) {
    return res.status(400).json({ erro: 'E-mail ou PIN inválido.' });
  }

  try {
    const perfil = await Perfil.buscarPorEmail(email.trim().toLowerCase());
    if (!perfil || !verificarPin(pin, perfil.pin_seguranca)) {
      return res.status(401).json({ erro: 'E-mail ou PIN incorreto.' });
    }
    return res.status(200).json({
      usuario: perfilPublico(perfil),
      token: criarSessao(perfil.id),
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao autenticar perfil.' });
  }
}

async function atualizar(req, res) {
  const id = req.userId;
  const { nome, email, pin } = req.body || {};
  if (!Number.isInteger(id) || id <= 0 ||
      !dadosValidos({ nome, email, pin }, false) ||
      (pin !== undefined && !pinValido(pin))) {
    return res.status(400).json({ erro: 'Dados do perfil inválidos.' });
  }

  try {
    const atualizado = await Perfil.atualizar(
      id,
      nome.trim(),
      email.trim().toLowerCase(),
      pin ? hashPin(pin) : null,
    );
    if (!atualizado) return res.status(404).json({ erro: 'Perfil não encontrado.' });
    return res.status(200).json(perfilPublico(await Perfil.buscarPorId(id)));
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Já existe um perfil com este e-mail.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
}

async function excluir(req, res) {
  const id = req.userId;
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: 'ID do perfil inválido.' });
  }

  try {
    const excluido = await Perfil.excluir(id);
    if (!excluido) return res.status(404).json({ erro: 'Perfil não encontrado.' });
    removerSessoes(id);
    return res.status(204).end();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro ao excluir perfil.' });
  }
}

module.exports = { listar, buscarPorId, criar, autenticar, atualizar, excluir };