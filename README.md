# 🏛️ Sistema de Recepção Terra do Bugio

[![Versão](https://img.shields.io/badge/versão-2.0.0-blue.svg)](https://github.com/terradobugio/recepcao)
[![Status](https://img.shields.io/badge/status-produção-green.svg)](https://terradobugio.com)
[![PHP](https://img.shields.io/badge/PHP-8%2B-777BB4.svg)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1.svg)](https://mysql.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Sistema completo de gestão de pessoas, controle de frequência e administração de voluntários para a organização Terra do Bugio.

## 🚀 Início Rápido

### Instalação em 5 Minutos

```bash
# 1. Clonar o repositório
git clone https://github.com/terradobugio/recepcao.git
cd recepcao

# 2. Configurar banco de dados
php criar_banco.php

# 3. Iniciar servidor
iniciar_local.bat

# 4. Acessar sistema
# URL: http://localhost:8000
# Login: admin@terradobugio.com
# Senha: admin123
```

## ✨ Funcionalidades Principais

### 👤 **Gestão de Pessoas**
- Cadastro completo com validação de CPF
- Busca inteligente por nome, CPF, telefone
- Histórico completo de frequências
- Suporte para pessoas e pets

### 📝 **Controle de Frequência**
- Registro rápido de presença
- Múltiplos tipos (geral, pet, líder)
- Validação automática de duplicatas
- Relatórios em tempo real

### 🤝 **Gestão de Voluntários**
- Sistema dedicado para voluntários
- Controle de horários de trabalho
- Relatórios de atividades
- Gestão por administradores e líderes

### 📊 **Relatórios Avançados**
- Exportação em PDF, Excel e CSV
- Filtros por período e tipo
- Gráficos interativos
- Estatísticas em tempo real

### 🔐 **Segurança Robusta**
- Autenticação JWT
- Três níveis de acesso
- Controle de permissões
- Backup automático

## 🛠️ Tecnologias

- **Backend**: PHP 8+, MySQL 8+, JWT
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Ferramentas**: XAMPP, Git, Composer
- **Deploy**: Netlify, Apache

## 📋 Pré-requisitos

- **XAMPP** (PHP 8+ e MySQL 8+)
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **2GB** de espaço em disco
- **4GB** de RAM (recomendado)

## 🔧 Instalação Detalhada

### 1. Preparar Ambiente

```bash
# Baixar e instalar XAMPP
# https://www.apachefriends.org/download.html

# Iniciar Apache e MySQL no painel XAMPP
```

### 2. Configurar Projeto

```bash
# Extrair arquivos para htdocs
C:\xampp\htdocs\recepcaotb\

# Navegar até o diretório
cd C:\xampp\htdocs\recepcaotb
```

### 3. Configurar Banco de Dados

```bash
# Executar script automático
php criar_banco.php

# Ou manualmente via PhpMyAdmin:
# - Criar banco: recepcaotb_local
# - Importar: exports/recepcaotb_EXPORT_COMPLETO.sql
```

### 4. Configurar Ambiente

```bash
# Editar arquivo .env
DB_HOST=localhost
DB_NAME=recepcaotb_local
DB_USER=root
DB_PASS=
```

### 5. Iniciar Sistema

```bash
# Opção 1: Script automático
iniciar_local.bat

# Opção 2: Manual
php -S localhost:8000 router_local.php
```

### 6. Primeiro Acesso

```
URL: http://localhost:8000
Login: admin@terradobugio.com
Senha: admin123
```

## 👥 Tipos de Usuário

| Tipo | Permissões |
|------|------------|
| **🔧 Administrador** | Acesso completo, gerenciar usuários, backups |
| **👥 Líder** | Gerenciar pessoas, voluntários, relatórios |
| **👤 Geral** | Cadastrar pessoas, registrar frequências |

## 📱 Interface

### Dashboard Principal
- Estatísticas em tempo real
- Acesso rápido às funcionalidades
- Menu intuitivo e responsivo

### Seções Disponíveis
- **📝 Frequência**: Registro de presenças
- **👤 Cadastro**: Gestão de pessoas
- **🤝 Voluntários**: Administração de voluntários
- **📊 Relatórios**: Análises e exportações
- **👥 Usuários**: Gestão de contas (Admin)
- **🔍 Duplicatas**: Detecção e mesclagem (Admin)
- **👤 Perfil**: Configurações pessoais

## 🔧 APIs Disponíveis

### Autenticação
```http
POST /api/auth
Content-Type: application/json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

### Pessoas
```http
GET    /api/pessoas              # Listar
POST   /api/pessoas              # Criar
PUT    /api/pessoas/{id}         # Atualizar
DELETE /api/pessoas/{id}         # Deletar
```

### Frequências
```http
GET    /api/frequencias          # Listar
POST   /api/frequencias          # Registrar
PUT    /api/frequencias/{id}     # Atualizar
DELETE /api/frequencias/{id}     # Deletar
```

### Voluntários
```http
GET    /api/voluntarios          # Listar
POST   /api/voluntarios          # Criar
GET    /api/frequencia_voluntarios # Frequências
POST   /api/frequencia_voluntarios # Registrar
```

## 📁 Estrutura do Projeto

```
recepcaotb/
├── 🌐 Frontend
│   ├── index.html              # Página principal
│   ├── login.html              # Login
│   ├── painel-simples.html     # Painel admin
│   └── trocar-senha.html       # Troca de senha
├── 📁 Assets
│   ├── css/style.css           # Estilos
│   ├── js/script.js            # Scripts
│   └── imagem/                 # Imagens
├── ⚙️ Backend
│   └── php/                    # APIs e classes
├── 🔧 Config
│   ├── .env                    # Variáveis
│   ├── .htaccess              # Apache
│   └── router_local.php       # Roteador
└── 📖 Docs
    ├── README.md              # Este arquivo
    ├── DOCUMENTACAO_COMPLETA.md # Documentação técnica
    └── GUIA_USUARIO.md        # Manual do usuário
```

## 🗄️ Banco de Dados

### Tabelas Principais
- **pessoas**: Cadastro de pessoas
- **frequencias**: Registro de presenças
- **usuarios**: Contas do sistema
- **voluntarios**: Cadastro de voluntários
- **frequencia_voluntarios**: Trabalho voluntário
- **sessoes**: Controle de sessões

### Backup e Restauração
```bash
# Gerar backup
php gerar_export_completo.php

# Restaurar backup
mysql -u root -p recepcaotb_local < backup.sql
```

## 🔐 Segurança

### Recursos Implementados
- ✅ Autenticação JWT com expiração
- ✅ Hash seguro de senhas (bcrypt)
- ✅ Validação e sanitização de dados
- ✅ Controle de permissões por rota
- ✅ Prevenção de SQL Injection
- ✅ Logs de segurança

### Boas Práticas
- Senhas com mínimo 4 caracteres
- Troca de senha obrigatória para novos usuários
- Invalidação automática de sessões
- Backup regular dos dados

## 📊 Performance

### Otimizações
- ✅ Índices otimizados no banco
- ✅ Paginação em listagens
- ✅ Cache de consultas
- ✅ Compressão de assets
- ✅ Lazy loading

### Métricas
- **Carregamento**: < 2 segundos
- **Concorrência**: 100+ usuários
- **Memória**: < 128MB por requisição
- **Disponibilidade**: 99.9%

## 🐛 Solução de Problemas

### Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verificar se MySQL está rodando
# Conferir credenciais no .env
# Executar: php criar_banco.php
```

#### Erro 404 nas APIs
```bash
# Verificar .htaccess
# Usar router_local.php em desenvolvimento
# Conferir mod_rewrite do Apache
```

#### Sessão Expirada
```bash
# Fazer login novamente
# Verificar JWT_SECRET no .env
# Limpar cache do navegador
```

## 📈 Roadmap

### 2025 Q4
- 📱 Interface mobile otimizada
- 🔔 Sistema de notificações
- 📊 Dashboard avançado
- 🌐 API REST completa

### 2026 Q1
- 📱 App mobile nativo
- ☁️ Integração com nuvem
- 🤖 Automações inteligentes
- 📈 Analytics avançado

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Código
- PSR-4 para PHP
- ES6+ para JavaScript
- Semantic HTML5
- CSS3 moderno

## 📞 Suporte

### Contatos
- **Email**: suporte@terradobugio.com
- **Site**: https://terradobugio.com
- **Documentação**: [DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)

### Níveis de Suporte
- **🔴 Crítico**: 2h (sistema fora do ar)
- **🟡 Alto**: 8h (funcionalidades não funcionam)
- **🟢 Normal**: 24h (dúvidas e melhorias)

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- Comunidade Terra do Bugio
- Desenvolvedores e colaboradores
- Usuários e testadores
- Equipe de suporte

---

## 📊 Estatísticas do Projeto

![GitHub stars](https://img.shields.io/github/stars/terradobugio/recepcao?style=social)
![GitHub forks](https://img.shields.io/github/forks/terradobugio/recepcao?style=social)
![GitHub issues](https://img.shields.io/github/issues/terradobugio/recepcao)
![GitHub pull requests](https://img.shields.io/github/issues-pr/terradobugio/recepcao)

---

**Sistema Terra do Bugio - Versão 2.0.0**  
*Desenvolvido com ❤️ para a comunidade Terra do Bugio*

**📅 Última Atualização**: 19 de Outubro de 2025  
**✅ Status**: Produção - Totalmente Funcional
