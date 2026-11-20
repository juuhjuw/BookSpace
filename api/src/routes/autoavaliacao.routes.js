const express = require('express');
const router = express.Router();
const {
  exigirSessao,
  validarUsuarioSolicitado,
} = require('../middleware/auth');

const AutoavaliacaoController = require('../controllers/autoavaliacao.controller');
router.use(exigirSessao, validarUsuarioSolicitado);
router.get('/', AutoavaliacaoController.listar);
router.get('/:id', AutoavaliacaoController.buscarPorId);
router.post('/', AutoavaliacaoController.criar);
router.put('/:id', AutoavaliacaoController.atualizar);
router.delete('/:id', AutoavaliacaoController.excluir);

module.exports = router;
