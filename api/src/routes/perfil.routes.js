const { Router } = require('express');
const { profileController } = require('../controllers/perfil.controller');
const { schemas, validate } = require('../middleware/validation');
module.exports = (db, auth, sensitiveLimit) => {
  const router = Router();
  const controller = profileController(db, auth);
  router.get('/', controller.get);
  router.put('/', validate(schemas.profile), controller.update);
  // Reutiliza limite por usuária também na confirmação da senha para exclusão.
  router.delete('/', sensitiveLimit, validate(schemas.deleteProfile), controller.remove);
  return router;
};
