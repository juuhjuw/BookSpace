# BookSpace — App de Apoio Camuflado

Projeto Integrador · 4º Semestre ADS · 2026 · Desenvolvimento Móvel & Data Science
Universidade Positivo · Prof. Alex Junior Nunes

> ⚠️ **Protótipo acadêmico.** Este app é fictício e não substitui atendimento policial, jurídico, psicológico ou de saúde. Todos os dados usados nos testes são fictícios.

##  Canais de ajuda

| Canal | Telefone |
|---|---|
| Central de Atendimento à Mulher | **Ligue 180** (24h) |
| Polícia Militar / Emergências | **Ligue 190** |

Esses canais aparecem de forma visível dentro do app e nesta documentação.

## Ideia do projeto

O BookSpace é um aplicativo que, à primeira vista, funciona como um app comum e inofensivo, mas possui uma área de apoio camuflada para mulheres em situação de violência doméstica. O programa oferece recursos como rede de contatos de confiança, registro seguro de ocorrências, avaliação de risco e acesso a canais de ajuda. O projeto busca proporcionar uma forma discreta e segura de acesso a informações e recursos de proteção.


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

##  Matriz de papéis

Cada integrante é responsável por 1 CRUD completo (modelagem, rotas da API, telas e integração real, com relacionamento com outra entidade).

| Integrante | CRUD (Mobile + API) | Etapa do pipeline de Data Science |
|---|---|---|
| Ana Julia Prado |  Perfil da Usuária | EDA & Eng. Atributos |
| Ana Julia Prado | Diário de Ocorrências | EDA & Eng. Atributos  |
| Ana Clara Mantella | Rede de Apoio |Qualidade (coleta e limpeza dos dados) |
| Ana Julia Fernandes | Autoavaliação | Modelagem e avaliação |

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

##  Data Science

- **Objetivo do modelo:** Prever ou classificar o nível de risco de violência (ou necessidade de apoio) com base nos fatores informados na autoavaliação/questionário da usuária, ajudando a direcionar orientações e canais de ajuda
- **Base de dados (pública e legítima):** Foi selecionada a base pública e oficial do Ligue 180 / Ouvidoria Nacional de Direitos Humanos (ONDH), extraída do Portal Brasileiro de Dados Abertos (dados.gov.br). Trata-se de uma base totalmente anônima, agregada e de acesso público, estando em conformidade com a LGPD e adequada para análises estatísticas e exploratórias do projeto.
- **Etapas:** EDA, tratamento, modelo, métricas e validação cruzada
- **Integração no app:** O modelo treinado será exposto via API (Backend). O aplicativo Mobile consumirá essa API enviando as respostas do questionário de autoavaliação e recebendo o resultado (retorno) do nível de risco para exibir na tela

##  Estrutura do repositório

```
/mobile      → app React Native + Expo
/api         → back-end Node.js + Express
/data        → notebook de Data Science
README.md
USO_IA.md
```

##  Como rodar

Preencher: instalar dependências, subir a API, abrir o app com Expo

##  Gestão do projeto

- **Quadro Kanban:** https://trello.com/b/PRBT5miE/bookspace-projeto-integrador
- **Colunas:** A Fazer, Em Andamento, Em Revisão, Concluído
- **GitHub:** repositório único, todos como colaboradores

