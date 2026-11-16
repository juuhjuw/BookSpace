const { profileModel } = require('../models/perfil.model');
const { HttpError } = require('../utils/errors');
// Alteração de e-mail/senha fica pendente até existir recuperação/verificação da conta.
function profileController(db, auth) {
  const model = profileModel(db);
  return {
    get: async (req, res) => {
      const profile = await model.find(req.auth.userId);
      if (!profile) throw new HttpError(404, 'NOT_FOUND', 'Perfil não encontrado.');
      res.json(profile);
    },
    update: async (req, res) => res.json(await model.update(req.auth.userId, req.body.nome)),
    remove: async (req, res) => {
      await auth.verifyPassword(req.auth.userId, req.body.senha);
      await model.remove(req.auth.userId);
      res.status(204).end();
    },
  };
}
module.exports = { profileController };
