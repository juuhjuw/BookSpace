
require('dotenv').config();

const app = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API BookSpace disponível na porta ${PORT}`);
});
