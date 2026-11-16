const { HttpError } = require('../utils/errors');
const missing = () => new HttpError(404, 'NOT_FOUND', 'Registro não encontrado.');
// Mesmo 404 para ID inexistente ou de outra usuária, evitando revelar propriedade.
function ownedController(model, prepare = body => body) {
  return {
    list: async (req, res) => res.json({ data: await model.list(req.auth.userId, req.pagination), ...req.pagination }),
    get: async (req, res) => {
      const item = await model.find(req.auth.userId, req.params.id);
      if (!item) throw missing();
      res.json(item);
    },
    create: async (req, res) => res.status(201).json(await model.create(req.auth.userId, prepare(req.body))),
    update: async (req, res) => {
      const item = await model.update(req.auth.userId, req.params.id, prepare(req.body));
      if (!item) throw missing();
      res.json(item);
    },
    remove: async (req, res) => {
      if (!await model.remove(req.auth.userId, req.params.id)) throw missing();
      res.status(204).end();
    },
  };
}
module.exports = { ownedController };
