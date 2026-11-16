const { HttpError } = require('../utils/errors');
// Pendência explícita em vez de retornar dados simulados como se fossem persistidos.
function notImplemented() {
  throw new HttpError(501, 'NOT_IMPLEMENTED', 'Autoavaliação pendente de questionário e regra versionada.');
}
module.exports = { notImplemented };
