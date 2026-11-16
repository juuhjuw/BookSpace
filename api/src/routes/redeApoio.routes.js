const { ownedRoutes } = require('./owned.routes');
const { contactController } = require('../controllers/redeApoio.controller');
const { schemas } = require('../middleware/validation');
// Propriedade do contato é determinada pela sessão.
module.exports = db => ownedRoutes(contactController(db), schemas.contact);
