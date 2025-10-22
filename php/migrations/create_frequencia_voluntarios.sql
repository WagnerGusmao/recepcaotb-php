-- Criação da tabela frequencia_voluntarios
-- Sistema Terra do Bugio - Frequência de Voluntários

-- Primeiro, criar a tabela voluntarios se não existir
CREATE TABLE IF NOT EXISTS voluntarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    religiao VARCHAR(100),
    estado VARCHAR(50),
    cidade VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar a tabela frequencia_voluntarios
CREATE TABLE IF NOT EXISTS frequencia_voluntarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voluntario_id INT NOT NULL,
    data_trabalho DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    local_inicio ENUM(
        'Recepção', 
        'Café', 
        'Brechó', 
        'Memorial', 
        'Hospital', 
        'Pet', 
        'Espaço Criança', 
        'Acolhimento', 
        'Segurança'
    ) NOT NULL,
    local_fim ENUM(
        'Recepção', 
        'Café', 
        'Brechó', 
        'Memorial', 
        'Hospital', 
        'Pet', 
        'Espaço Criança', 
        'Acolhimento', 
        'Segurança'
    ),
    observacoes TEXT,
    lancado_por INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chaves estrangeiras
    FOREIGN KEY (voluntario_id) REFERENCES voluntarios(id) ON DELETE CASCADE,
    FOREIGN KEY (lancado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices para performance
    INDEX idx_voluntario_data (voluntario_id, data_trabalho),
    INDEX idx_data_trabalho (data_trabalho),
    INDEX idx_local_inicio (local_inicio),
    
    -- Constraint para evitar duplicatas na mesma data/voluntário
    UNIQUE KEY unique_voluntario_data (voluntario_id, data_trabalho)
);

-- Comentários nas tabelas
ALTER TABLE voluntarios COMMENT = 'Cadastro de voluntários do Terra do Bugio';
ALTER TABLE frequencia_voluntarios COMMENT = 'Registro de frequência e locais de trabalho dos voluntários';
