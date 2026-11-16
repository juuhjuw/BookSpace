const { Router } = require('express');
const { notImplemented } = require('../controllers/autoavaliacao.controller');
const { idParam } = require('../middleware/validation');
// Não há PUT/DELETE de avaliações: histórico planejado é imutável.
module.exports = () => {
  const router = Router();
  router.get('/', notImplemented);
  router.get('/:id', idParam, notImplemented);
  router.post('/', notImplemented);
  return router;
};
