const { diaryModel } = require('../models/diario.model');
const { ownedController } = require('./owned.controller');
// Converte ISO com fuso para DATETIME UTC. Leituras de DATETIME são strings UTC.
const diaryController = db => ownedController(diaryModel(db), body => ({
  ...body, data_ocorrencia: new Date(body.data_ocorrencia).toISOString().slice(0, 19).replace('T', ' '),
}));
module.exports = { diaryController };
