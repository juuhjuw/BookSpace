const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

router.post("/prever", (req, res) => {
  const campos = ["AG_AMEACA", "AG_ENFOR", "AG_FOGO"];

  const valido = campos.every(
    (campo) => [0, 1].includes(req.body?.[campo])
  );

  if (!valido) {
    return res.status(400).json({
      erro: "Informe as três variáveis com valores 0 ou 1."
    });
  }

  const caminho = path.join(__dirname, "../../prever.py");

  const python = spawn("py", [caminho]);

  let resultado = "";
  let erro = "";

  python.stdout.on("data", (dados) => {
    resultado += dados.toString();
  });

  python.stderr.on("data", (dados) => {
    erro += dados.toString();
  });

  python.on("error", (falha) => {
    console.error(falha);
    if (!res.headersSent) {
      res.status(500).json({ erro: "Não foi possível iniciar o Python." });
    }
  });

  python.on("close", (codigo) => {
    if (res.headersSent) return;

    if (codigo !== 0) {
      console.error(erro);
      return res.status(500).json({
        erro: "Erro ao executar o modelo."
      });
    }

    try {
      res.json(JSON.parse(resultado));
    } catch {
      res.status(500).json({
        erro: "Resposta inválida do modelo."
      });
    }
  });

  python.stdin.end(JSON.stringify(req.body));
});

module.exports = router;