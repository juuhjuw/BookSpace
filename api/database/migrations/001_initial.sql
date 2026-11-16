-- Base para banco novo MySQL 8.4. Não converte automaticamente o rascunho antigo.
CREATE TABLE `User` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  pin_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sessões opacas revogáveis. Só o hash do token é armazenado.
CREATE TABLE Sessoes (
  token_hash CHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  expira_em DATETIME NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessoes_user (user_id),
  INDEX idx_sessoes_expira (expira_em),
  FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Categoria livre limitada até a equipe fechar a taxonomia do formulário.
CREATE TABLE Diario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  descricao TEXT NOT NULL,
  data_ocorrencia DATETIME NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_diario_user_data (user_id, data_ocorrencia, id),
  FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- alerta_ativo é apenas uma preferência, não existe envio de alerta nesta base.
CREATE TABLE Rede_Apoio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nome_contato VARCHAR(100) NOT NULL,
  telefone VARCHAR(25) NOT NULL,
  vinculo VARCHAR(80) NOT NULL,
  prioridade TINYINT NOT NULL DEFAULT 1,
  alerta_ativo BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_prioridade CHECK (prioridade BETWEEN 1 AND 5),
  CONSTRAINT chk_alerta CHECK (alerta_ativo IN (0, 1)),
  INDEX idx_rede_user_prioridade (user_id, prioridade, id),
  FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Estrutura reservada. TODO: definir questionário/regras antes de liberar gravações.
-- Resultados históricos serão imutáveis e versionados, separados do modelo de ML.
CREATE TABLE Autoavaliacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  versao_questionario VARCHAR(40) NOT NULL,
  pontuacao_total DECIMAL(8,2) NOT NULL,
  nivel_risco ENUM('baixo', 'moderado', 'alto') NOT NULL,
  respostas_json JSON NOT NULL,
  data_avaliacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pontuacao CHECK (pontuacao_total >= 0),
  INDEX idx_avaliacao_user_data (user_id, data_avaliacao, id),
  FOREIGN KEY (user_id) REFERENCES `User`(id) ON DELETE CASCADE
) ENGINE=InnoDB;
