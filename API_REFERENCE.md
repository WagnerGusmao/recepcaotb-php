# 🔌 API Reference - Sistema Terra do Bugio

Documentação completa das APIs do Sistema de Recepção Terra do Bugio.

## 📋 Índice

- [Autenticação](#autenticação)
- [Pessoas](#pessoas)
- [Frequências](#frequências)
- [Usuários](#usuários)
- [Duplicatas](#duplicatas)
- [Relatórios](#relatórios)
- [Backup](#backup)
- [Health Check](#health-check)
- [Códigos de Status](#códigos-de-status)
- [Tratamento de Erros](#tratamento-de-erros)

## 🔐 Autenticação

Todas as rotas protegidas requerem token JWT no header Authorization.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@terradobugio.com",
  "password": "admin123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "nome": "ADM",
    "email": "admin@terradobugio.com",
    "tipo": "administrador",
    "ativo": true
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "valid": true,
  "user": { ... }
}
```

---

## 👥 Pessoas

### Listar Pessoas
```http
GET /api/pessoas?busca={termo}&limit={numero}
Authorization: Bearer {token}
```

**Parâmetros**:
- `busca` (opcional): Termo de busca (nome, CPF, cidade)
- `limit` (opcional): Limite de resultados (padrão: 50, máximo: 50)

**Response (200)**:
```json
{
  "success": true,
  "pessoas": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "nascimento": "1990-01-15",
      "cidade": "São Paulo",
      "estado": "SP",
      "telefone": "(11) 99999-9999",
      "email": "joao@email.com",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Buscar Pessoa por ID
```http
GET /api/pessoas/{id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "pessoa": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "nascimento": "1990-01-15",
    "religiao": "Católica",
    "cidade": "São Paulo",
    "estado": "SP",
    "telefone": "(11) 99999-9999",
    "email": "joao@email.com",
    "indicacao": "Amigo",
    "observacao": "Primeira visita",
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### Cadastrar Pessoa
```http
POST /api/pessoas
Content-Type: application/json

{
  "nome": "Maria Santos",
  "cpf": "98765432100",
  "nascimento": "1985-05-20",
  "religiao": "Evangélica",
  "cidade": "Rio de Janeiro",
  "estado": "RJ",
  "telefone": "(21) 88888-8888",
  "email": "maria@email.com",
  "indicacao": "Internet",
  "observacao": "Interessada em voluntariado"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Pessoa cadastrada com sucesso",
  "pessoa": {
    "id": 2,
    "nome": "Maria Santos",
    "cpf": "98765432100",
    "created_at": "2024-01-15T14:30:00.000Z"
  }
}
```

### Editar Pessoa
```http
PUT /api/pessoas/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Maria Santos Silva",
  "telefone": "(21) 77777-7777",
  "email": "maria.silva@email.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Pessoa atualizada com sucesso",
  "pessoa": {
    "id": 2,
    "nome": "Maria Santos Silva",
    "telefone": "(21) 77777-7777",
    "email": "maria.silva@email.com"
  }
}
```

---

## 📊 Frequências

### Listar Frequências
```http
GET /api/frequencias?dataInicio={data}&dataFim={data}&tipo={tipo}&pessoaId={id}
Authorization: Bearer {token}
```

**Parâmetros**:
- `dataInicio` (opcional): Data inicial (YYYY-MM-DD)
- `dataFim` (opcional): Data final (YYYY-MM-DD)
- `tipo` (opcional): Tipo de frequência
- `pessoaId` (opcional): ID da pessoa

**Response (200)**:
```json
{
  "success": true,
  "frequencias": [
    {
      "id": 1,
      "pessoa_id": 1,
      "pessoa_nome": "João Silva",
      "tipo": "geral",
      "numero_senha": "A001",
      "data": "2024-01-15",
      "numero_senha_tutor": null,
      "numero_senha_pet": null,
      "created_at": "2024-01-15T09:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Registrar Frequência
```http
POST /api/frequencias
Authorization: Bearer {token}
Content-Type: application/json

{
  "pessoa_id": 1,
  "tipo": "pet_tutor",
  "numero_senha": "B025",
  "data": "2024-01-15",
  "numero_senha_tutor": "T001",
  "numero_senha_pet": "P001"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Frequência registrada com sucesso",
  "frequencia": {
    "id": 2,
    "pessoa_id": 1,
    "tipo": "pet_tutor",
    "numero_senha": "B025",
    "data": "2024-01-15",
    "numero_senha_tutor": "T001",
    "numero_senha_pet": "P001",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Tipos de Frequência
- `geral`: Atendimento geral
- `hospital`: Atendimento hospitalar
- `hospital_acompanhante`: Acompanhante no hospital
- `pet_tutor`: Tutor de pet
- `pet`: Atendimento de pet

---

## 🔐 Usuários

### Listar Usuários (Apenas Administradores)
```http
GET /api/usuarios
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "usuarios": [
    {
      "id": 2,
      "nome": "ADM",
      "email": "admin@terradobugio.com",
      "tipo": "administrador",
      "ativo": true,
      "pessoa_id": null,
      "pessoa_nome": null,
      "deve_trocar_senha": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Criar Usuário
```http
POST /api/usuarios
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Novo Usuário",
  "email": "usuario@terradobugio.com",
  "tipo": "geral",
  "pessoa_id": 1
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "usuario": {
    "id": 3,
    "nome": "Novo Usuário",
    "email": "usuario@terradobugio.com",
    "tipo": "geral",
    "ativo": true,
    "pessoa_id": 1,
    "deve_trocar_senha": true
  }
}
```

### Ativar/Desativar Usuário
```http
PUT /api/usuarios/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "ativo": false
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Status do usuário atualizado com sucesso"
}
```

### Reset de Senha
```http
PUT /api/usuarios/{id}/reset-senha
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Senha resetada com sucesso",
  "nova_senha": "senha_temporaria_123"
}
```

### Editar Perfil Próprio
```http
PUT /api/usuarios/perfil
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Novo Nome",
  "email": "novo@email.com"
}
```

### Trocar Senha Obrigatória
```http
PUT /api/usuarios/trocar-senha-obrigatoria
Authorization: Bearer {token}
Content-Type: application/json

{
  "senha_atual": "senha_atual",
  "nova_senha": "nova_senha_123"
}
```

### Excluir Usuário
```http
DELETE /api/usuarios/{id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

### Pessoas Disponíveis
```http
GET /api/usuarios/pessoas-disponiveis
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "pessoas": [
    {
      "id": 5,
      "nome": "Pessoa Sem Usuário",
      "email": "pessoa@email.com"
    }
  ]
}
```

---

## 🔍 Duplicatas

### Analisar Duplicatas
```http
GET /api/duplicatas?threshold={numero}
Authorization: Bearer {token}
```

**Parâmetros**:
- `threshold` (opcional): Limite de similaridade (0-100, padrão: 85)

**Response (200)**:
```json
{
  "success": true,
  "grupos_duplicados": [
    {
      "grupo_id": 1,
      "pessoas": [
        {
          "id": 100,
          "nome": "João Silva",
          "cpf": "12345678901",
          "similaridade": 95
        },
        {
          "id": 200,
          "nome": "Joao da Silva",
          "cpf": "12345678901",
          "similaridade": 90
        }
      ],
      "similaridade_media": 92.5,
      "frequencias_total": 5
    }
  ],
  "estatisticas": {
    "tempo_processamento": "151.2s",
    "pessoas_analisadas": 4662,
    "comparacoes_realizadas": 10696324,
    "velocidade": "70893 comparações/segundo",
    "grupos_encontrados": 53,
    "pessoas_duplicadas": 111
  },
  "cache_info": {
    "cached": true,
    "expires_at": "2024-01-15T11:00:00.000Z"
  }
}
```

### Mesclar Duplicatas
```http
POST /api/duplicatas/mesclar
Authorization: Bearer {token}
Content-Type: application/json

{
  "pessoa_principal_id": 100,
  "pessoas_secundarias_ids": [200, 300]
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Mesclagem realizada com sucesso",
  "resultado": {
    "pessoa_principal": {
      "id": 100,
      "nome": "João Silva"
    },
    "pessoas_removidas": [200, 300],
    "frequencias_transferidas": 8,
    "dados_mesclados": {
      "telefone": "atualizado",
      "email": "atualizado",
      "observacao": "concatenada"
    }
  }
}
```

### Mesclagem em Lote
```http
POST /api/duplicatas/mesclar-lote
Authorization: Bearer {token}
Content-Type: application/json

{
  "mesclagens": [
    {
      "pessoa_principal_id": 100,
      "pessoas_secundarias_ids": [200]
    },
    {
      "pessoa_principal_id": 300,
      "pessoas_secundarias_ids": [400, 500]
    }
  ]
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Mesclagem em lote concluída",
  "resultados": [
    {
      "pessoa_principal_id": 100,
      "status": "sucesso",
      "frequencias_transferidas": 3
    },
    {
      "pessoa_principal_id": 300,
      "status": "sucesso",
      "frequencias_transferidas": 7
    }
  ],
  "resumo": {
    "total_mesclagens": 2,
    "sucessos": 2,
    "erros": 0,
    "pessoas_removidas": 3,
    "frequencias_transferidas": 10
  }
}
```

---

## 📈 Relatórios

### Relatório Geral
```http
GET /api/relatorios/geral?dataInicio={data}&dataFim={data}&tipo={tipo}
Authorization: Bearer {token}
```

### Relatório Mensal
```http
GET /api/relatorios/mensal?ano={ano}
Authorization: Bearer {token}
```

### Relatório de Contatos
```http
GET /api/relatorios/contatos
Authorization: Bearer {token}
```

### Relatório por Cidades
```http
GET /api/relatorios/cidades
Authorization: Bearer {token}
```

### Relatório de Cadastros
```http
GET /api/relatorios/cadastros
Authorization: Bearer {token}
```

---

## 💾 Backup

### Criar Backup
```http
POST /api/backup/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "full"
}
```

**Tipos disponíveis**:
- `full`: Backup completo
- `cadastro`: Apenas pessoas e usuários
- `frequencia`: Apenas frequências

**Response (200)**:
```json
{
  "success": true,
  "message": "Backup criado com sucesso",
  "backup": {
    "filename": "recepcaotb_backup_2024-01-15_143022.sql",
    "path": "/backups/recepcaotb_backup_2024-01-15_143022.sql",
    "size": "2.5MB",
    "type": "full"
  }
}
```

### Listar Backups
```http
GET /api/backup/list
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "backups": [
    {
      "filename": "recepcaotb_backup_2024-01-15_143022.sql",
      "created": "2024-01-15T14:30:22.000Z",
      "size": 2621440,
      "type": "full"
    }
  ]
}
```

---

## 🏥 Health Check

### Status do Sistema
```http
GET /api/health
```

**Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T14:30:00.000Z",
  "uptime": "2h 30m 15s",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "type": "mysql",
    "version": "8.0.43"
  },
  "memory": {
    "used": "45.2MB",
    "total": "128MB"
  }
}
```

---

## 📋 Códigos de Status

### Códigos de Sucesso
- `200` - OK: Requisição bem-sucedida
- `201` - Created: Recurso criado com sucesso
- `204` - No Content: Operação bem-sucedida sem retorno

### Códigos de Erro do Cliente
- `400` - Bad Request: Dados inválidos ou malformados
- `401` - Unauthorized: Token inválido ou expirado
- `403` - Forbidden: Sem permissão para a operação
- `404` - Not Found: Recurso não encontrado
- `409` - Conflict: Conflito (ex: CPF duplicado)
- `422` - Unprocessable Entity: Validação falhou
- `429` - Too Many Requests: Rate limit excedido

### Códigos de Erro do Servidor
- `500` - Internal Server Error: Erro interno do servidor
- `502` - Bad Gateway: Erro de gateway
- `503` - Service Unavailable: Serviço indisponível

---

## ⚠️ Tratamento de Erros

### Formato Padrão de Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": {
      "field": "cpf",
      "message": "CPF já existe no sistema"
    }
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

### Códigos de Erro Específicos

#### Autenticação
- `AUTH_INVALID_CREDENTIALS`: Credenciais inválidas
- `AUTH_TOKEN_EXPIRED`: Token expirado
- `AUTH_TOKEN_INVALID`: Token inválido
- `AUTH_INSUFFICIENT_PERMISSIONS`: Permissões insuficientes

#### Validação
- `VALIDATION_ERROR`: Erro de validação geral
- `VALIDATION_REQUIRED_FIELD`: Campo obrigatório ausente
- `VALIDATION_INVALID_FORMAT`: Formato inválido
- `VALIDATION_DUPLICATE_ENTRY`: Entrada duplicada

#### Recursos
- `RESOURCE_NOT_FOUND`: Recurso não encontrado
- `RESOURCE_ALREADY_EXISTS`: Recurso já existe
- `RESOURCE_CONFLICT`: Conflito de recursos

#### Sistema
- `DATABASE_ERROR`: Erro no banco de dados
- `INTERNAL_ERROR`: Erro interno do servidor
- `RATE_LIMIT_EXCEEDED`: Limite de taxa excedido

### Exemplos de Erros Comuns

#### CPF Duplicado
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_DUPLICATE_ENTRY",
    "message": "CPF já cadastrado no sistema",
    "details": {
      "field": "cpf",
      "value": "12345678901",
      "existing_person_id": 123
    }
  }
}
```

#### Token Expirado
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Token de autenticação expirado",
    "details": {
      "expired_at": "2024-01-15T14:00:00.000Z"
    }
  }
}
```

#### Frequência Duplicada
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_DUPLICATE_ENTRY",
    "message": "Frequência já registrada para esta data",
    "details": {
      "pessoa_id": 123,
      "data": "2024-01-15",
      "existing_frequency_id": 456
    }
  }
}
```

---

## 🔧 Rate Limiting

### Limites Padrão
- **Janela**: 15 minutos
- **Máximo**: 100 requisições por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

### Resposta de Rate Limit
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Muitas requisições. Tente novamente em 15 minutos",
    "details": {
      "limit": 100,
      "window": "15 minutes",
      "reset_at": "2024-01-15T15:00:00.000Z"
    }
  }
}
```

---

**© 2024 Sistema de Recepção Terra do Bugio - API Reference v1.0.0**
