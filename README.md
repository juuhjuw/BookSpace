# BookSpace — App de Apoio Camuflado

Projeto Integrador · 4º Semestre ADS · 2026 · Desenvolvimento Móvel & Data Science
Universidade Positivo · Prof. Alex Junior Nunes

> **Protótipo acadêmico.** Este app não substitui atendimento policial, jurídico, psicológico ou de saúde. A base do estudo é pública e agregada/anonimizada; os perfis e registros criados no app são dados de teste da pessoa que executa a demonstração. Não use dados reais de vítimas.

##  Canais de ajuda

| Canal | Telefone |
|---|---|
| Central de Atendimento à Mulher | **Ligue 180** (24h) |
| Polícia Militar / Emergências | **Ligue 190** |

Esses canais aparecem de forma visível dentro do app e nesta documentação.

## Ideia do projeto

O BookSpace é um aplicativo que, à primeira vista, funciona como um app comum e inofensivo, mas possui uma área de apoio camuflada para mulheres em situação de violência doméstica. O programa oferece recursos como rede de contatos de confiança, registro pessoal de ocorrências e sinais, além de acesso a canais de ajuda. O app não atribui nível de risco nem prevê episódios futuros.


##  Disfarce

- **Fachada escolhida:** Aplicativo de Biblioteca
- **Como entrar na área de apoio:** Long-press (toque longo) em um livro específico 
- **Saída rápida (quick exit):** Um botão com design de marca-página

##  Integrantes

| Nome | GitHub | Disciplinas |
|---|---|---|
| Ana Julia Prado | juuhjuw | Mobile e Data Science |
| Ana Clara Mantella | anaclaramantellaa | Mobile e Data Science |
| Ana Julia Fernandes | AnaJuliaSFernandes | Mobile e Data Science |
| Guilherme Dorigon | gDorigon | Mobile e Data Science |

##  Matriz de papéis

Cada integrante é responsável por 1 CRUD completo (modelagem, rotas da API, telas e integração real, com relacionamento com outra entidade).

| Integrante | CRUD (Mobile + API) | Etapa do pipeline de Data Science |
|---|---|---|
| Ana Clara Mantella | Perfil da usuária — `User`, `/usuarios`, tela Perfil | EDA & engenharia de atributos |
| Ana Julia Prado | Diário de ocorrências — `Diario`, `/diarios`, tela Diário | EDA & engenharia de atributos |
| Guilherme Dorigon | Rede de apoio — `Rede_Apoio`, `/rede-apoio`, tela Rede | Qualidade, coleta e limpeza |
| Ana Julia Fernandes | Registro de sinais — `Autoavaliacao`, `/autoavaliacoes`, telas de registro e histórico | Modelagem e avaliação |

Responsabilidades em grupo: navegação e disfarce de ponta a ponta, organização e qualidade do código, integração do modelo no app.

### Entidades e relacionamentos

| CRUD | Tabela | Relaciona com |
|---|---|---|
| Perfil da Usuária | User | Diario, Autoavaliacao, Rede_Apoio |
| Diário de Ocorrências | Diario | User |
| Rede de Apoio | Rede_Apoio | User |
| Autoavaliação | Autoavaliacao | User |

##  Tecnologias

- **Mobile:** React Native + Expo
- **Back-end:** Node.js + Express
- **Banco de dados:** MySQL
- **Data Science:** Python (notebook)

## Data Science

- **Base:** SINAN — Violência Interpessoal/Autoprovocada, notificações de 2024, recortadas e anonimizadas para o projeto. O alvo `OUT_VEZES` informa recorrência já registrada, não episódio futuro.
- **Validação:** regressão logística com imputação em pipeline, holdout estratificado de 20% e validação cruzada estratificada de cinco folds. No notebook: baseline de acurácia 72,34%; no holdout, acurácia de 54%; na validação cruzada, acurácia média de 53,76%, precisão de 84,19%, recall de 44,43% e F1 de 58,16%. O desempenho em acurácia ficou abaixo do baseline.
- **Integração:** `GET /modelo/contexto` entrega apenas prevalência e métricas agregadas da base e do modelo. Respostas individuais não são enviadas ao modelo nem transformadas em pontuação ou classificação de risco. O notebook já contém células executadas, métricas e gráficos; consulte [`data/README.md`](data/README.md) para reprodução.
- **Limite acadêmico:** esse experimento de recorrência registrada tem desempenho abaixo do baseline e serve somente como contexto acadêmico agregado. Não avalia o risco de uma pessoa, não prevê violência futura e não substitui serviços profissionais.

##  Estrutura do repositório

```
/mobile      → app React Native + Expo
/api         → back-end Node.js + Express
/data        → notebook de Data Science
README.md
USO_IA.md
```

##  Como rodar

### Pré-requisitos

- Node.js 20 ou superior e npm.
- MariaDB 10.4.32 local (porta 3306). Este é o ambiente de banco validado (XAMPP 8.2.12); MySQL 8 não foi testado nesta entrega.
- Python 3.11–3.13 somente para reproduzir o notebook.

### API

No PowerShell, na raiz do repositório:

```powershell
Copy-Item api\.env.example api\.env
```

Crie o schema e um usuário MySQL restrito ao banco da aplicação. O exemplo de senha abaixo é um marcador: escolha uma senha local e use o mesmo valor em `api\.env`.

```powershell
cmd.exe /c "mysql -u root -p < api\database\schema.sql"
```

Abra o cliente interativo com `mysql -u root -p` e execute:

```sql
CREATE USER 'bookspace'@'localhost' IDENTIFIED BY 'defina-uma-senha-local';
GRANT SELECT, INSERT, UPDATE, DELETE ON bookspace.* TO 'bookspace'@'localhost';
```

Saia com `exit`, configure em `api\.env` o usuário/senha definidos (o `.env.example` não contém credenciais válidas) e inicie a API:

```powershell
Set-Location api
npm ci
npm test
npm start
```

O endpoint `http://localhost:3000/health` confirma que a API está ativa. A API grava os registros relacionados por `user_id`; a exclusão de perfil remove registros dependentes pelo `ON DELETE CASCADE`. Os PINs são armazenados com scrypt; o login emite tokens bearer de 12 horas mantidos apenas em memória (reiniciar a API encerra as sessões). Este protótipo não tem HTTPS, recuperação de conta ou infraestrutura de autenticação para produção: não o exponha publicamente nem use dados sensíveis reais.

### Validação e pendências da Entrega 4

- A API foi exercitada em `localhost:3000` com MariaDB 10.4.32 do XAMPP e dados sintéticos. Passaram 29 verificações de cadastro/login, consulta e listagem de perfis, CRUD de Diário, Rede de Apoio e Autoavaliação, contexto agregado do modelo, isolamento por `user_id`, chaves estrangeiras e exclusão em cascata. Os registros temporários foram removidos.
- `npm test` usa repositórios em memória; esses testes não substituem o smoke test da API com banco real nem testes de integração no dispositivo.
- Ainda precisam de validação manual em aparelho ou emulador: entrada camuflada, PIN, saída rápida e conexão pela rede do dispositivo.
- A atualização do quadro Kanban e os commits individuais dos demais integrantes continuam pendentes.

Todos os recursos do CRUD exigem `Authorization: Bearer <token>`; `POST /usuarios` (cadastro), `POST /usuarios/login` e `GET /modelo/contexto` são as exceções públicas. A listagem de usuários retorna apenas o perfil da sessão:

| Recurso | Listagem | Por ID | Criar | Atualizar | Excluir |
|---|---|---|---|---|---|
| Perfil | `GET /usuarios` | `GET /usuarios/:id` | `POST /usuarios` | `PUT /usuarios/:id` | `DELETE /usuarios/:id` |
| Diário | `GET /diarios?user_id=:id` | `GET /diarios/:id?user_id=:id` | `POST /diarios` | `PUT /diarios/:id` | `DELETE /diarios/:id?user_id=:id` |
| Rede de apoio | `GET /rede-apoio?user_id=:id` | `GET /rede-apoio/:id?user_id=:id` | `POST /rede-apoio` | `PUT /rede-apoio/:id` | `DELETE /rede-apoio/:id?user_id=:id` |
| Registro de sinais | `GET /autoavaliacoes?user_id=:id` | `GET /autoavaliacoes/:id?user_id=:id` | `POST /autoavaliacoes` | `PUT /autoavaliacoes/:id` | `DELETE /autoavaliacoes/:id?user_id=:id` |

O token determina a conta permitida e `user_id` associa os registros à chave estrangeira. Respostas inválidas retornam `400`, sessão inválida `401`, recurso ausente `404` e e-mail duplicado `409`; exclusões bem-sucedidas retornam `204`.

### Expo

Em outro terminal:

```powershell
cd mobile
npm ci
npm start
```

Use Expo Go e leia o QR code. No emulador Android, `localhost` deve apontar para o computador conforme a configuração de rede do emulador; no aparelho físico, copie `mobile\.env.example` para `mobile\.env` e substitua `localhost` pelo IPv4 LAN do computador (o celular e o computador devem estar na mesma rede). Se abrir o app web em outra origem, inclua essa origem em `CORS_ORIGIN` de `api\.env` e reinicie a API. `npx expo start --web` abre o cliente web.

### Notebook

Consulte [`data/README.md`](data/README.md) para criar o ambiente Python e executar o notebook com métricas e gráficos.

##  Gestão do projeto

- **Quadro Kanban:** https://trello.com/b/PRBT5miE/bookspace-projeto-integrador
- **Colunas:** A Fazer, Em Andamento, Em Revisão, Concluído
- **GitHub:** repositório único, todos como colaboradores

