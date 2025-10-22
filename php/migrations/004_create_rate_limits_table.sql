-- Migration: Criar tabela de rate limiting
-- Data: 2025-10-22
-- Descrição: Tabela para controlar tentativas de login e prevenir ataques de força bruta

CREATE TABLE IF NOT EXISTS rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL COMMENT 'Chave única (IP + email ou outro identificador)',
    attempts INT DEFAULT 0 COMMENT 'Número de tentativas',
    expires_at DATETIME NOT NULL COMMENT 'Data/hora de expiração do bloqueio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    UNIQUE KEY unique_key (key_name),
    KEY idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Controle de rate limiting para prevenir ataques de força bruta';

-- Índices adicionais para performance
CREATE INDEX idx_key_expires ON rate_limits(key_name, expires_at);

-- Comentários nas colunas
ALTER TABLE rate_limits 
    MODIFY COLUMN key_name VARCHAR(255) NOT NULL COMMENT 'Formato: tipo:ip:identificador (ex: login:192.168.1.1:user@email.com)';
