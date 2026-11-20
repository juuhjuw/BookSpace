
require('dotenv').config();

const express = require('express');
const app = express();
const cors = require("cors");

const autoavaliacaoRoutes = require('./src/routes/autoavaliacao.routes');
const modeloRoutes = require("./src/routes/modelo.routes");

app.use(cors({
  origin: "http://localhost:8081",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'API BookSpace funcionando!' });
});

app.use("/autoavaliacoes", autoavaliacaoRoutes);
app.use("/modelo", modeloRoutes);

app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
