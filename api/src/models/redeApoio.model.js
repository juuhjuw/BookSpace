const { ownedModel } = require('./owned.model');
// Prioridade 1 aparece primeiro. Não há disparo de notificações/SMS nesta base.
const contactModel = db => ownedModel(db, {
  table: 'Rede_Apoio', fields: ['nome_contato', 'telefone', 'vinculo', 'prioridade', 'alerta_ativo'],
  order: 'prioridade ASC, id ASC',
  normalize: row => ({ ...row, alerta_ativo: Boolean(row.alerta_ativo) }),
});
module.exports = { contactModel };
