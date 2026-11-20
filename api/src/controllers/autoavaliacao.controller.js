
const Autoavaliacao = require('../models/autoavaliacao.model');

// Listar autoavaliações de um usuário
async function listar(req, res) {
    try {
        const userId = Number(req.query.user_id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                erro: 'ID do usuário inválido.'
            });
        }

        const avaliacoes = await Autoavaliacao.listar(userId);
        return res.status(200).json(avaliacoes);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao listar autoavaliações.'
        });
    }
}

// Buscar uma autoavaliação pelo ID
async function buscarPorId(req, res) {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.query.user_id);

        if (!Number.isInteger(id) || id <= 0 ||
            !Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                erro: 'ID inválido.'
            });
        }

        const avaliacao = await Autoavaliacao.buscarPorId(id, userId);

        if (!avaliacao) {
            return res.status(404).json({
                erro: 'Autoavaliação não encontrada.'
            });
        }

        return res.status(200).json(avaliacao);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao buscar autoavaliação.'
        });
    }
}

// Criar uma nova autoavaliação
async function criar(req, res) {
    try {
        const { user_id, pontuacao_total, nivel_risco, respostas } = req.body;

        const userId = Number(user_id);

        if (!Number.isInteger(userId) || userId <= 0 ||
            !Number.isInteger(pontuacao_total) ||
            typeof nivel_risco !== 'string' ||
            !nivel_risco.trim() ||
            nivel_risco.length > 20 ||
            !respostas || typeof respostas !== 'object' ||
            Array.isArray(respostas)) {
            return res.status(400).json({
                erro: 'Dados da autoavaliação inválidos.'
            });
        }

        const id = await Autoavaliacao.criar(
            userId,
            pontuacao_total,
            nivel_risco,
            respostas
        );

        return res.status(201).json({
            mensagem: 'Autoavaliação salva com sucesso!',
            id
        });
    } catch (erro) {
        console.error(erro);

        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                erro: 'Usuário não encontrado.'
            });
        }

        return res.status(500).json({
            erro: 'Erro ao salvar autoavaliação.'
        });
    }
}

// Atualizar uma autoavaliação
async function atualizar(req, res) {
    try {
        const id = Number(req.params.id);
        const { user_id, pontuacao_total, nivel_risco, respostas } = req.body;
        const userId = Number(user_id);

        if (!Number.isInteger(id) || id <= 0 ||
            !Number.isInteger(userId) || userId <= 0 ||
            !Number.isInteger(pontuacao_total) ||
            typeof nivel_risco !== 'string' ||
            !nivel_risco.trim() ||
            nivel_risco.length > 20 ||
            !respostas || typeof respostas !== 'object' ||
            Array.isArray(respostas)) {
            return res.status(400).json({
                erro: 'Dados inválidos.'
            });
        }

        const atualizado = await Autoavaliacao.atualizar(
            id,
            userId,
            pontuacao_total,
            nivel_risco,
            respostas
        );

        if (!atualizado) {
            return res.status(404).json({
                erro: 'Autoavaliação não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Autoavaliação atualizada com sucesso!'
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao atualizar autoavaliação.'
        });
    }
}

// Excluir uma autoavaliação
async function excluir(req, res) {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.query.user_id);

        if (!Number.isInteger(id) || id <= 0 ||
            !Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                erro: 'ID inválido.'
            });
        }

        const excluido = await Autoavaliacao.excluir(id, userId);

        if (!excluido) {
            return res.status(404).json({
                erro: 'Autoavaliação não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Autoavaliação excluída com sucesso!'
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao excluir autoavaliação.'
        });
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    excluir
};
