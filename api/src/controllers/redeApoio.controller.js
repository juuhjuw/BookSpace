const { contactModel } = require('../models/redeApoio.model');
const { ownedController } = require('./owned.controller');
// Validação fica na rota, persistência no model e resposta no controller compartilhado.
const contactController = db => ownedController(contactModel(db));
module.exports = { contactController };
