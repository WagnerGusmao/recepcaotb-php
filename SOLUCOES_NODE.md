## Soluções para o Problema do Node.js

### Problema Identificado:
O erro está relacionado ao caminho do projeto que contém espaços e caracteres especiais: `g:\Meu Drive\Terra do Bugio\Sistema_Frequencia - Copia`

### Soluções Recomendadas:

#### 1. **Mover o Projeto (RECOMENDADO)**
```bash
# Mova o projeto para um caminho sem espaços
C:\projetos\sistema-frequencia\
```

#### 2. **Executar como Administrador**
- Abra o CMD como Administrador
- Navegue até a pasta do projeto
- Execute: `npm install`

#### 3. **Usar PowerShell**
```powershell
# No PowerShell, execute:
Set-Location "g:\Meu Drive\Terra do Bugio\Sistema_Frequencia - Copia\backend"
npm install --no-optional
```

#### 4. **Configurar npm para ignorar erros**
```bash
npm config set audit false
npm config set fund false
npm install --no-optional --ignore-scripts
```

#### 5. **Usar Yarn como alternativa**
```bash
# Instalar Yarn
npm install -g yarn
# Usar Yarn no lugar do npm
yarn install
```

### Carga Manual dos Dados:
Como alternativa, você pode inserir os dados manualmente no banco SQLite usando um cliente visual como:
- DB Browser for SQLite
- SQLiteStudio

### Dados para Inserir:
```sql
INSERT INTO pessoas (nome, cpf, nascimento, sexo, cidade, estado, telefone, email, indicacao) VALUES
('João Silva', '123.456.789-01', '1985-03-15', 'M', 'São Paulo', 'SP', '(11) 99999-1234', 'joao@email.com', 'Amigos/Parentes'),
('Maria Santos', NULL, '1990-07-22', 'F', 'Rio de Janeiro', 'RJ', '(21) 88888-5678', 'maria@email.com', 'Curso Terra do Bugio'),
('Pedro Oliveira', '987.654.321-09', '1978-12-10', 'M', 'Belo Horizonte', 'MG', '(31) 77777-9012', 'pedro@email.com', 'Facebook'),
('Ana Costa', '456.789.123-45', NULL, 'F', 'Salvador', 'BA', '(71) 66666-3456', NULL, 'Instagram'),
('Carlos Ferreira', '789.123.456-78', '1995-05-30', 'M', 'Fortaleza', 'CE', '(85) 55555-7890', 'carlos@email.com', 'Mercado Mistico'),
('Lucia Pereira', NULL, '1982-11-18', 'F', 'Recife', 'PE', '(81) 44444-2345', 'lucia@email.com', 'Rádio Atual'),
('Roberto Lima', '321.654.987-12', '1988-09-05', 'M', 'Porto Alegre', 'RS', '(51) 33333-6789', 'roberto@email.com', 'TV Astral'),
('Fernanda Alves', '654.987.321-56', '1992-01-25', 'F', 'Curitiba', 'PR', NULL, 'fernanda@email.com', 'Youtube');
```