const { Router } = require('express');
const { validate, idParam, pagination } = require('../middleware/validation');
// Router só é montado depois da autenticação global das áreas protegidas.
function ownedRoutes(controller, schema) {
  const router = Router();
  router.get('/', pagination, controller.list);
  router.get('/:id', idParam, controller.get);
  router.post('/', validate(schema), controller.create);
  router.put('/:id', idParam, validate(schema), controller.update);
  router.delete('/:id', idParam, controller.remove);
  return router;
}
module.exports = { ownedRoutes };
