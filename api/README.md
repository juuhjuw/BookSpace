# API e banco do BookSpace

Base acadêmica em Node.js/Express e MySQL 8.4. O mobile ainda usa dados locais/simulados: esta entrega não conecta as telas à API. Utilize somente dados fictícios enquanto as pendências de publicação e proteção dos dados não forem resolvidas.

## O que está implementado

| Área | Entrega |
|---|---|
| Execução | Projeto npm independente, configuração validada, inicialização e encerramento gracioso |
| Banco | Pool MySQL, migration com checksum/lock, índices, relacionamentos e exclusão em cascata |
| Desenvolvimento | Compose opcional para MySQL e seed opt-in com dados fictícios |
| Autenticação | Cadastro, login, sessão Bearer com expiração, logout e hash scrypt de senha/PIN |
| PIN | Verificação autenticada e troca com confirmação de senha |
| Perfil | Consultar, alterar nome e excluir conta confirmando senha |
| Diário | Criar, listar com paginação, consultar, substituir e excluir registros próprios |
| Rede de apoio | Mesmo CRUD, incluindo vínculo, prioridade e preferência de alerta |
| Resumo | Contagens reais da usuária e último nível salvo, ou `null` |
| Infraestrutura HTTP | Validação, SQL parametrizado, limite de corpo, headers, CORS e limites de requisição |
| Testes | Testes sem banco e suíte opt-in de integração com MySQL |

Autoavaliação e refresh retornam **501 NOT_IMPLEMENTED**. As rotas pendentes não simulam sucesso. Não há envio de alertas, SMS ou notificações: `alerta_ativo` só persiste uma preferência.

A escolha de sessões opacas simplifica a revogação e evita uma chave JWT nesta base. Em contrapartida, cada chamada protegida consulta o banco e a expiração exige novo login. O PIN confirma um desbloqueio de interface; **os CRUDs exigem apenas a sessão, não uma segunda autorização por PIN**. Essa segunda barreira precisa ser desenhada antes de depender dela como proteção dos dados.

## Pré-requisitos

- Node.js 22 ou superior e npm.
- MySQL 8.4 disponível, ou Docker com Compose para a alternativa abaixo.
- Terminal do macOS. Execute os comandos na raiz do repositório, salvo indicação contrária.

Nenhum comando abaixo instala MySQL no sistema. Docker é opcional e deve estar disponível caso escolhido. Não é necessário instalar dependências do mobile para executar a API.

## Primeiro uso com banco em contêiner

```sh
cd api
cp .env.example .env
npm ci
# Ajuste as senhas em .env antes de compartilhar um ambiente.
docker compose up -d --wait db
npm run db:migrate
# Opt-in válido apenas para development. Cria uma conta e exemplos fictícios.
ALLOW_DEV_SEED=true npm run db:seed
npm run dev
```

O Compose usa as variáveis do `.env`, publica o MySQL apenas em `127.0.0.1` e mantém os dados em volume. A API roda no host; mantenha `DB_HOST=127.0.0.1`. Se a porta 3306 estiver ocupada, altere `DB_PORT` no `.env` antes de subir o contêiner.

Aguarde o banco ficar saudável. Se o Compose não reconhecer `--wait`, use `docker compose up -d db` e consulte `docker compose ps` até o estado ficar `healthy` antes das migrations.

Para parar, use **Control + C** no terminal da API e depois `docker compose stop db`. Para voltar, `docker compose start db` e `npm run dev`. `docker compose down` remove o contêiner, mas mantém o volume; não use `down -v` sem querer apagar todo o banco local.

As credenciais iniciais do exemplo são `demo@bookspace.test`, senha `DemoLocal!12345`, PIN `4826`. São públicas e servem só para desenvolvimento. Altere `SEED_EMAIL`, `SEED_PASSWORD` e `SEED_PIN` no `.env` para personalizar **antes da primeira seed**. A seed não altera nem duplica uma conta que já exista com esse e-mail, nem repõe exemplos apagados. Não cria autoavaliações enquanto a regra estiver pendente. O endereço `.test` e o telefone da seed são fictícios.

O MySQL só cria usuário/senha/banco no primeiro uso de um volume vazio. Mudar essas variáveis no `.env` depois não altera as credenciais do volume existente; ajuste pelo administrador do banco, preservando os dados.

## Usando um MySQL existente

Crie um banco vazio com `utf8mb4` e um usuário próprio com acesso a ele. Não use root na API. Exemplo para o administrador executar, substituindo a senha e o host conforme o ambiente:

```sql
CREATE DATABASE bookspace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bookspace'@'localhost' IDENTIFIED BY 'substituir_por_senha_local';
GRANT ALL PRIVILEGES ON bookspace.* TO 'bookspace'@'localhost';
```

Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` no `api/.env`. Execute `npm ci`, `npm run db:migrate`, opcionalmente a seed e `npm run dev` dentro de `api/`. As permissões amplas desse exemplo local atendem migrations; em publicação, separar usuário de migration do usuário da API com permissões só de leitura/escrita necessárias.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NODE_ENV` | `development`, `test` ou `production`; seed só em development |
| `PORT` | Porta HTTP da API, padrão 3000 |
| `DB_HOST`, `DB_PORT` | Endereço do MySQL e porta, padrão 3306 |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Credenciais e banco já provisionados |
| `MYSQL_ROOT_PASSWORD` | Apenas inicialização do contêiner, não é usada pela API |
| `CORS_ORIGINS` | Origens web exatas, separadas por vírgulas |
| `SESSION_HOURS` | Validade da sessão, entre 1 e 24 horas, padrão 8 |
| `ALLOW_DEV_SEED` | Confirmação explícita para seed, padrão false |
| `SEED_EMAIL`, `SEED_PASSWORD`, `SEED_PIN` | Conta fictícia da seed |

O `.env` é ignorado pelo Git. Não versionar tokens ou dados reais. A configuração é carregada por caminho absoluto relativo ao código, sem depender do diretório atual do terminal.

## Estrutura e evolução do banco

```text
src/app.js              fábrica Express, middlewares e montagem de rotas
src/server.js           conexão, porta e encerramento
src/config/             ambiente e pool
src/routes/             contratos, validação e encaminhamento
src/controllers/        respostas HTTP e orquestração dos CRUDs
src/models/             SQL e propriedade dos registros
src/services/           autenticação e sessão
src/middleware/         autenticação, validação e paginação
src/utils/              hashes e erros públicos
scripts/migrate.js      aplicação explícita de migrations
scripts/seed.js         dados fictícios de desenvolvimento
database/migrations/   DDL versionado (fonte de verdade)
test/                   testes sem banco e integração opt-in
```

A migration `001_initial.sql` substitui o rascunho anterior. `database/schema.sql` aponta para a fonte de verdade e não deve ser executado como instalador separado.

- `User`: identidade, hashes e timestamps, sem senha/PIN em respostas.
- `Sessoes`: hash SHA-256 de token aleatório, FK e expiração UTC.
- `Diario`: categoria, descrição, ocorrência em UTC e timestamps.
- `Rede_Apoio`: nome, telefone, vínculo, prioridade de 1 a 5 e alerta booleano.
- `Autoavaliacao`: estrutura reservada com versão, pontuação, enum de nível e respostas JSON.
- `schema_migrations`: versão, checksum e data de aplicação.

Registros dependentes são excluídos por `ON DELETE CASCADE` ao excluir uma conta. As consultas usam índices iniciados em `user_id`. Não existe soft delete. A eliminação em backups ainda depende da política de retenção a ser definida.

**Banco com tabelas do rascunho antigo:** o runner recusa a aplicação inicial. Faça backup e crie outro banco vazio para esta base. Se for necessário preservar registros antigos, escreva e revise uma conversão específica; não remova tabelas nem marque migrations manualmente para contornar o bloqueio.

Novas mudanças devem entrar em `002_descricao.sql`, `003_descricao.sql`, etc. Não altere arquivos já aplicados: o checksum detecta mudanças. Execute migrations por um único processo; o runner usa lock no MySQL. O parser aceita instruções simples separadas por `;`, sem procedures, delimiters nem `;` dentro de strings.

**Limite do MySQL:** DDL faz commit implícito; se uma migration falhar no meio, algumas tabelas podem já existir. O histórico só é gravado no fim de cada arquivo. Corrija o ambiente/SQL e avalie o estado com o administrador antes de repetir; não há rollback automático. Em um banco descartável novo, recriar o banco pode ser a opção mais simples, sempre confirmando que não há dados a preservar.

## Contrato HTTP

Base local: `http://localhost:3000`, sem prefixo `/api`. Requisições com corpo usam `Content-Type: application/json`. Autenticadas usam `Authorization: Bearer TOKEN`. Não enviar `user_id`: o servidor usa a identidade da sessão.

| Método e caminho | Corpo / resultado |
|---|---|
| `GET /health` | `{ "status": "ok" }` sem consultar banco |
| `GET /health/ready` | 200 com banco acessível, 503 quando indisponível |
| `POST /auth/register` | `{ "nome", "email", "senha", "pin" }`; 201 com perfil público; não faz login automático |
| `POST /auth/login` | `{ "email", "senha" }`; 200 com `{ "token", "tokenType", "expiraEm" }` |
| `POST /auth/refresh` | 501, pendente |
| `POST /auth/logout` | Sessão obrigatória, sem corpo; 204 e revogação do token atual |
| `POST /auth/verify-pin` | Sessão + `{ "pin": "4826" }`; 200 `{ "valido": true }` ou 401 |
| `PUT /auth/pin` | Sessão + `{ "senha", "pin" }`; 204 |
| `GET /perfil` | Perfil público autenticado |
| `PUT /perfil` | `{ "nome": "Novo nome" }`; perfil atualizado; e-mail/senha não são editáveis ainda |
| `DELETE /perfil` | `{ "senha": "senha atual" }`; 204; exclui conta e dependências |
| `GET /diarios`, `GET /rede-apoio` | `{ "data": [...], "limit": 20, "offset": 0 }` |
| `GET /diarios/:id`, `GET /rede-apoio/:id` | Registro próprio ou 404 |
| `POST /diarios`, `POST /rede-apoio` | Corpo completo abaixo; 201 com registro |
| `PUT /diarios/:id`, `PUT /rede-apoio/:id` | Corpo completo abaixo; 200 com registro |
| `DELETE /diarios/:id`, `DELETE /rede-apoio/:id` | 204 sem corpo |
| `GET /autoavaliacoes`, `GET /autoavaliacoes/:id`, `POST /autoavaliacoes` | Exigem sessão; 501 nesta base |
| `GET /dashboard/resumo` | `{ "totalDiarios": 1, "totalContatos": 1, "ultimoNivelRisco": null }` |

Campos extras são rejeitados. Nome tem até 100 caracteres, e-mail até 150, senha de cadastro de 12 a 128 e PIN é **string** de quatro dígitos (preserva zeros iniciais). Login usa mensagem genérica para e-mail ausente/senha errada. Cadastro duplicado retorna 409 genérico; não há garantia de impedir enumeração por cadastro nesta etapa.

Diário, obrigatório em POST e PUT:

```json
{
  "categoria": "Exemplo acadêmico",
  "descricao": "Registro fictício para teste",
  "data_ocorrencia": "2026-11-15T12:00:00-03:00"
}
```

Categoria é texto livre de 1 a 80 caracteres até definir taxonomia; descrição de 1 a 10000. Data deve resultar em um ano UTC entre 1000 e 9999 e precisa ser ISO 8601 com fuso (`Z` ou deslocamento). O servidor converte para UTC e devolve campos DATETIME/TIMESTAMP como `YYYY-MM-DD HH:mm:ss` **em UTC**. O mobile deverá interpretar explicitamente como UTC e formatar para o fuso da pessoa; não interpretar como horário local.

Rede de apoio, obrigatório em POST e PUT:

```json
{
  "nome_contato": "Contato fictício",
  "telefone": "+55 00 00000-0000",
  "vinculo": "Exemplo",
  "prioridade": 1,
  "alerta_ativo": false
}
```

Vínculo tem até 80 caracteres, telefone aceita `+` inicial, dígitos, espaços, parênteses e hífens, com 8 a 25 caracteres. É validação de formato básica, sem garantia de número real. Prioridade é inteiro de 1 a 5 (1 aparece primeiro). Alerta é booleano JSON e não executa ações externas.

Listagens aceitam `?limit=20&offset=0`: limite de 1 a 100, offset de 0 a 1000000. Diário ordena por ocorrência e ID decrescentes; contatos por prioridade e ID crescentes. Não há total de resultados nem paginação por cursor nesta base.

Erros seguem este formato:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Campos inválidos ou ausentes. Consulte o contrato da API." } }
```

Códigos principais: 400 entrada/JSON inválido, 401 sessão/credenciais/PIN inválidos, 403 origem web recusada, 404 rota/registro inexistente ou de outra usuária, 409 conflito, 413 corpo acima de 64 KB, 429 limite, 500 falha interna, 501 pendência e 503 readiness sem banco. Falhas internas não devolvem SQL, stack ou valores de entrada.

## Exemplo de teste manual

Com API e seed em execução, em outro terminal:

```sh
curl http://localhost:3000/health/ready
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@bookspace.test","senha":"DemoLocal!12345"}'
```

Copie o `token` retornado para a variável temporária abaixo, somente no ambiente de desenvolvimento:

```sh
BOOKSPACE_TOKEN='cole_o_token_aqui'
curl http://localhost:3000/perfil -H "Authorization: Bearer $BOOKSPACE_TOKEN"
curl 'http://localhost:3000/diarios?limit=20&offset=0' -H "Authorization: Bearer $BOOKSPACE_TOKEN"
curl http://localhost:3000/dashboard/resumo -H "Authorization: Bearer $BOOKSPACE_TOKEN"
curl -X POST http://localhost:3000/auth/logout -H "Authorization: Bearer $BOOKSPACE_TOKEN"
unset BOOKSPACE_TOKEN
```

Após logout, o mesmo token deve receber 401. Não salvar tokens reais no repositório, screenshots, histórico compartilhado ou documentação.

## Testes

Sem banco, dentro de `api/`:

```sh
npm test
```

A suíte verifica hashes, validação, filtros de propriedade e HTTP com pool simulado (health, CORS, autenticação, limites, erros e 501). Não comprova o comportamento do MySQL.

Para integração, crie um **banco separado terminado em `_test`**. No contêiner local, abra `docker compose exec db mysql -uroot -p` e informe a senha root configurada. Execute:

```sql
CREATE DATABASE bookspace_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON bookspace_test.* TO 'bookspace'@'%';
```

Depois, no terminal de `api/`:

```sh
NODE_ENV=test DB_NAME=bookspace_test RUN_DB_TESTS=true npm run test:integration
```

O teste aplica migrations no banco de testes, cria duas contas temporárias e verifica login, PIN, isolamento entre usuárias, CRUDs, resumo, revogação e cascata. Remove só as contas que criou. Não aponta para o banco do app e não executa seed. Sem `RUN_DB_TESTS=true`, o teste é marcado como ignorado; isso não significa integração validada.

### Verificação desta entrega

Os quatro testes de `npm test` passaram com Node.js 26.9.0. O teste HTTP usa uma porta local temporária e pool simulado. A suíte de integração foi conferida no modo sem opt-in e ficou ignorada. MySQL não foi instalado nem iniciado nesta preparação: migrations, seed e integração com banco real ainda precisam ser executadas pela equipe seguindo os comandos acima. `git diff --check` também passou.

## Integração futura com mobile

1. Criar cliente HTTP central com URL por ambiente. iOS Simulator no Mac pode usar `http://localhost:3000`; aparelho físico precisa do IP do Mac na mesma rede, com porta acessível. A API escuta em `0.0.0.0` para desenvolvimento.
2. Substituir o cadastro automático local por cadastro e login explícitos. Guardar token em armazenamento seguro, como SecureStore, e limpar ao sair/receber 401. Não usar AsyncStorage para token, senha ou PIN.
3. Substituir PIN fixo por `/auth/verify-pin` e remover exibição/armazenamento do PIN no perfil. Essa confirmação sozinha não restringe a API por PIN; decidir segunda autorização se necessário.
4. Integrar perfil, diário e contatos usando os contratos, sem enviar `user_id`.
5. Alimentar o resumo; tratar `ultimoNivelRisco: null` como ausência de avaliação, não como risco baixo.
6. Incluir carregamento, erro, lista vazia, confirmação de exclusão e repetição de tentativas. Em 429 respeitar `Retry-After`.
7. Manter avaliação indisponível para persistência até sair do 501. Não enviar a pontuação calculada no app como resultado confiável.
8. Definir cache mínimo e funcionamento sem internet posteriormente, sem persistir relatos sensíveis por conveniência.

A vantagem de adiar sincronização offline é reduzir conflitos e cópias locais sensíveis. A limitação é depender de conexão para as operações da API.

## Pendências por prioridade

### Antes da integração completa

- [ ] Aprovar questionário, identificadores das perguntas e versão da regra determinística; definir se categorias/níveis devem mudar.
- [ ] Implementar autoavaliação: validação de respostas, cálculo no servidor, histórico imutável e testes de fronteira. Não apresentar regra acadêmica como avaliação clínica validada.
- [ ] Implementar refresh com rotação/revogação ou aceitar explicitamente novo login após expiração.
- [ ] Implementar recuperação e alteração de senha/e-mail com verificação e revogação de sessões.
- [ ] Integrar mobile e remover mocks/PIN fixo, com armazenamento seguro e estados de erro.
- [ ] Executar a suíte com MySQL 8.4 real e testar migrations/seed duas vezes para verificar reexecução.
- [ ] Completar OpenAPI ou coleção de requisições e testes dos fluxos mobile.

### Antes de publicar ou usar dados reais

- [ ] Definir consentimento/finalidade, minimização, retenção, acesso e exclusão de dados/backups.
- [ ] Definir criptografia dos campos sensíveis e gestão/rotação de chaves. **Hashes protegem senha/PIN, mas relatos e telefones ainda ficam legíveis no banco.** A vantagem de criptografar é reduzir exposição do conteúdo do banco; o custo é gerir chaves e restringir buscas.
- [ ] Configurar HTTPS, TLS do banco remoto, CORS com origens reais e usuário MySQL de menor privilégio. CORS não substitui autenticação.
- [ ] Store compartilhado de rate limit, limitação por conta no login e defesa contra tentativas distribuídas. Limites atuais: 200 requisições/IP por 15 min; cadastro/login compartilham 10/IP; PIN/troca/exclusão compartilham 5/usuária. São contadores em memória e reiniciam com o processo.
- [ ] Configurar proxy confiável explicitamente; a API não habilita `trust proxy` automaticamente.
- [ ] Definir se a área protegida exige autorização adicional após PIN, com expiração e bloqueio persistente.
- [ ] Agendar remoção de sessões expiradas (`DELETE FROM Sessoes WHERE expira_em <= UTC_TIMESTAMP()`), backups e restauração testada. Expiração já impede acesso mesmo sem limpeza.
- [ ] Observabilidade com identificação de erros sem registrar payloads, contatos, descrições, senhas, PINs ou tokens.
- [ ] Revisar dependências, implantar CI e realizar revisão de segurança e acessibilidade das telas.

### Data Science e funcionalidades posteriores

- [ ] Resolver a divergência do README entre recorrência no diário e nível de risco da autoavaliação.
- [ ] Treinar/avaliar/versionar modelo de recorrência separadamente do questionário; definir entradas efetivamente coletadas, sem apresentá-lo como previsão clínica.
- [ ] Definir notificações/alertas e suas permissões antes de atribuir efeito a `alerta_ativo`.
- [ ] Avaliar sincronização offline, paginação por cursor e migration de dados legados apenas quando houver necessidade.

## Referências técnicas

A base usa [scrypt e comparação de hashes do Node.js](https://nodejs.org/api/crypto.html), [orientações de segurança do Express](https://expressjs.com/en/advanced/best-practice-security/) e [chaves estrangeiras do MySQL](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html). Essas referências explicam os mecanismos usados; não substituem as revisões pendentes do produto.
