const express = require('express');
const router = express.Router();
const controller = require('../controllers/perfil.controller');
const {
  exigirSessao,
  exigirProprioPerfil,
} = require('../middleware/auth');

router.post('/', controller.criar);
router.post('/login', controller.autenticar);
router.use(exigirSessao);
router.get('/', controller.listar);
router.get('/:id', exigirProprioPerfil, controller.buscarPorId);
router.put('/:id', exigirProprioPerfil, controller.atualizar);
router.delete('/:id', exigirProprioPerfil, controller.excluir);

module.exports = router;
