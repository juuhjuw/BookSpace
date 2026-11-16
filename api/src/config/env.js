const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
const { z } = require('zod');

// Falha cedo sem imprimir valores sensíveis; caminho independe do terminal.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_USER: z.string().min(1), DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/),
  CORS_ORIGINS: z.string().default('http://localhost:8081'),
  SESSION_HOURS: z.coerce.number().int().min(1).max(24).default(8),
});
const result = schema.safeParse(process.env);
if (!result.success) throw new Error(`Configuração inválida; verifique: ${result.error.issues.map(i => i.path.join('.')).join(', ')}`);
module.exports = result.data;
