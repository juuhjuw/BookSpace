// Rotas do CRUD: Autoavaliação de Risco
// Responsável: Ana Julia Fernandes
// TODO: GET, POST, PUT, DELETE

const express = require('express');
const router = express.Router();

const AutoavaliacaoController = require('../controllers/autoavaliacao.controller');
router.get('/', AutoavaliacaoController.listar);
router.get('/:id', AutoavaliacaoController.buscarPorId);
router.post('/', AutoavaliacaoController.criar);
router.put('/:id', AutoavaliacaoController.atualizar);
router.delete('/:id', AutoavaliacaoController.excluir);

module.exports = router;
