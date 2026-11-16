const { ownedRoutes } = require('./owned.routes');
const { diaryController } = require('../controllers/diario.controller');
const { schemas } = require('../middleware/validation');
// PUT substitui os campos editáveis por completo, não é atualização parcial.
module.exports = db => ownedRoutes(diaryController(db), schemas.diary);
