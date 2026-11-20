const express = require('express');
const router = express.Router();
const controller = require('../controllers/diario.controller');
const {
  exigirSessao,
  validarUsuarioSolicitado,
} = require('../middleware/auth');

router.use(exigirSessao, validarUsuarioSolicitado);
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

module.exports = router;
