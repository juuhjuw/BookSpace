const { z } = require('zod');
const { HttpError } = require('../utils/errors');

// Objetos estritos rejeitam campos inesperados, inclusive user_id enviado pelo cliente.
const text = max => z.string().trim().min(1).max(max);
const password = z.string().min(12).max(128);
const pin = z.string().regex(/^\d{4}$/);
const email = z.email().max(150).transform(value => value.toLowerCase());
const schemas = {
  register: z.strictObject({ nome: text(100), email, senha: password, pin }),
  login: z.strictObject({ email, senha: z.string().min(1).max(128) }),
  pin: z.strictObject({ pin }),
  changePin: z.strictObject({ senha: z.string().min(1).max(128), pin }),
  profile: z.strictObject({ nome: text(100) }),
  // Exclusão exige confirmação da senha; token sozinho não é suficiente.
  deleteProfile: z.strictObject({ senha: z.string().min(1).max(128) }),
  diary: z.strictObject({
    categoria: text(80), descricao: text(10000),
    // DATETIME do MySQL aceita anos 1000 a 9999, após conversão para UTC.
    data_ocorrencia: z.iso.datetime({ offset: true }).refine(value => {
      const time = Date.parse(value);
      return time >= Date.parse('1000-01-01T00:00:00Z') && time <= Date.parse('9999-12-31T23:59:59Z');
    }),
  }),
  contact: z.strictObject({
    nome_contato: text(100), telefone: z.string().regex(/^\+?[\d ()-]{8,25}$/),
    vinculo: text(80), prioridade: z.number().int().min(1).max(5), alerta_ativo: z.boolean(),
  }),
};
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new HttpError(400, 'VALIDATION_ERROR', 'Campos inválidos ou ausentes. Consulte o contrato da API.'));
    req.body = result.data;
    next();
  };
}
function idParam(req, res, next) {
  if (!/^[1-9]\d{0,9}$/.test(req.params.id) || Number(req.params.id) > 2147483647) {
    return next(new HttpError(400, 'INVALID_ID', 'Identificador inválido.'));
  }
  next();
}
function pagination(req, res, next) {
  // Paginação limitada impede carregar todo o histórico em uma requisição.
  const result = z.strictObject({
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
    offset: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(1000000)).default(0),
  }).safeParse(req.query);
  if (!result.success) return next(new HttpError(400, 'INVALID_PAGINATION', 'Use limit de 1 a 100 e offset de 0 a 1000000.'));
  req.pagination = result.data;
  next();
}
module.exports = { schemas, validate, idParam, pagination };
