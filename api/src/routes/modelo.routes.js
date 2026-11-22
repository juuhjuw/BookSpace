const express = require("express");
const router = express.Router();

router.get("/contexto", (req, res) => {
  res.json({
    fonte: "SINAN — Violência Interpessoal/Autoprovocada, notificações de 2024",
    alvo: "Recorrência já registrada na notificação (OUT_VEZES), não violência futura",
    amostra: {
      notificacoesComAlvoConhecido: 89988,
      proporcaoComRecorrenciaRegistrada: 0.723,
    },
    validacao: {
      particaoTeste: 0.2,
      foldsEstratificados: 5,
      baselineAcuracia: 0.7234,
      acuraciaMedia: 0.5376,
      precisaoMedia: 0.8419,
      recallMedio: 0.4443,
      f1Medio: 0.5816,
      acuraciaTeste: 0.54,
    },
    aviso: "Contexto estatístico agregado de notificações da base. Não avalia uma pessoa, não estima risco individual nem prevê episódios futuros.",
  });
});

module.exports = router;