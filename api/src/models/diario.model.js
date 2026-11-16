const { ownedModel } = require('./owned.model');
// TODO: adicionar campos estruturados apenas após definir a finalidade no Data Science.
const diaryModel = db => ownedModel(db, {
  table: 'Diario', fields: ['categoria', 'descricao', 'data_ocorrencia'],
  order: 'data_ocorrencia DESC, id DESC',
});
module.exports = { diaryModel };
