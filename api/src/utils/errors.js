// Erros conhecidos são públicos; erros internos nunca expõem SQL ou credenciais.
class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
module.exports = { HttpError };
