# 🏢 Sistema Terra do Bugio - Documentação Oficial

<div align="center">

![Logo Terra do Bugio](imagem/terrabugio.jpg)

**Sistema completo de gestão de recepção, cadastro e controle de frequências**

[![Status](https://img.shields.io/badge/Status-Produção-brightgreen)](SISTEMA_PRONTO_PARA_USO.md)
[![Versão](https://img.shields.io/badge/Versão-2.0-blue)](DOCUMENTACAO_OFICIAL.md)
[![PHP](https://img.shields.io/badge/PHP-8.0+-purple)](php/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)](exports/)

</div>

---

## 🎯 **Visão Geral**

O **Sistema Terra do Bugio** é uma aplicação web robusta e profissional desenvolvida especificamente para gestão administrativa da organização Terra do Bugio. Oferece controle completo de cadastros, frequências, voluntários e relatórios com interface moderna e responsiva.

### **✨ Destaques**
- 🌐 **Interface web moderna** e responsiva
- 👥 **Gestão completa de pessoas** e voluntários
- 📊 **Relatórios avançados** com exportação
- 🔐 **Sistema de usuários** com 3 níveis de acesso
- 🔍 **Análise inteligente** de duplicatas
- 💾 **Backup automático** e restore
- 🚀 **Performance otimizada** e segura

---

## 🚀 **Funcionalidades Principais**

<table>
<tr>
<td width="50%">

### **👥 Gestão de Pessoas**
- ✅ Cadastro público via web
- ✅ Busca avançada e filtros
- ✅ Edição completa de dados
- ✅ Validações automáticas
- ✅ Controle de duplicatas

### **📊 Controle de Frequências**
- ✅ Registro para diferentes tipos
- ✅ Frequências gerais e pets
- ✅ Controle por senhas
- ✅ Prevenção de duplicatas
- ✅ Histórico completo

### **🔍 Análise de Duplicatas**
- ✅ Algoritmo inteligente
- ✅ Detecção por similaridade
- ✅ Mesclagem seletiva
- ✅ Interface visual
- ✅ Transferência automática

</td>
<td width="50%">

### **🤝 Sistema de Voluntários**
- ✅ Cadastro especializado
- ✅ Controle de frequências
- ✅ 9 locais de trabalho
- ✅ Horários e observações
- ✅ Relatórios específicos

### **📈 Relatórios Avançados**
- ✅ 6 tipos de relatórios
- ✅ Filtros personalizáveis
- ✅ Exportação PDF/CSV/XLSX
- ✅ Estatísticas detalhadas
- ✅ Gráficos interativos

### **💾 Backup e Segurança**
- ✅ Backup automático
- ✅ Restore completo
- ✅ Autenticação JWT
- ✅ Controle de sessões
- ✅ Logs de auditoria

</td>
</tr>
</table>

---

## 🛠️ **Tecnologias**

### **Frontend**
- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo
- **JavaScript** - Interatividade vanilla
- **Chart.js** - Gráficos e estatísticas
- **jsPDF/XLSX** - Exportação de dados

### **Backend**
- **PHP 8.0+** - Linguagem principal
- **MySQL 8.0+** - Banco de dados
- **JWT** - Autenticação segura
- **PDO** - Acesso ao banco
- **Composer** - Gerenciamento de dependências

### **Arquitetura**
- **APIs RESTful** - Padrão JSON
- **MVC Pattern** - Organização do código
- **Prepared Statements** - Segurança SQL
- **Responsive Design** - Mobile-first

---

## 📦 **Instalação Rápida**

### **Pré-requisitos**
```bash
✅ PHP 8.0 ou superior
✅ MySQL 8.0 ou superior  
✅ Apache com mod_rewrite
✅ Composer para PHP
```

### **Passos de Instalação**
```bash
# 1. Instalar dependências PHP
cd php/
composer install

# 2. Configurar banco de dados
mysql -u root -p < exports/recepcaotb_FIXED_FULL_export_*.sql

# 3. Configurar ambiente
cp php/config/.env.example php/config/.env
# Editar configurações do banco no .env

# 4. Configurar permissões
chmod 755 -R ./
chown -R www-data:www-data ./
```

### **Credenciais Padrão**
- **Email**: `admin@terradobugio.com`
- **Senha**: `admin123`
- **Tipo**: Administrador

---

## 📚 **Documentação Completa**

<table>
<tr>
<td width="50%">

### **📖 Guias Principais**
- 📋 [**Documentação Oficial**](DOCUMENTACAO_OFICIAL.md) - Documentação técnica completa
- 🚀 [**Como Iniciar**](COMO_INICIAR.md) - Primeiros passos
- ⚙️ [**Guia de Instalação**](GUIA_INSTALACAO.md) - Instalação detalhada
- 👤 [**Manual do Usuário**](GUIA_USUARIO.md) - Como usar o sistema

### **🔧 Referências Técnicas**
- 🌐 [**API Reference**](API_REFERENCE.md) - Documentação das APIs
- ✅ [**Sistema Pronto**](SISTEMA_PRONTO_PARA_USO.md) - Status e credenciais

</td>
<td width="50%">

### **📝 Funcionalidades Específicas**
- 🎨 [**Cores e Logo**](CORES_E_LOGO_CORRIGIDOS.md) - Padronização visual
- 👥 [**Edição de Usuários**](EDICAO_TIPO_USUARIO_IMPLEMENTADA.md) - Gestão de tipos
- 🧹 [**Limpeza do Sistema**](LIMPEZA_PROFUNDA_CONCLUIDA.md) - Otimização

### **📊 Relatórios e Análises**
- ⏰ [**Relatório de Voluntários**](RELATORIO_VOLUNTARIOS_IMPLEMENTADO.md) - Funcionalidade completa

</td>
</tr>
</table>

---

## 🏗️ **Estrutura do Projeto**

```
📁 recepcaotb-16-10-PHP_MySQL/
├── 📄 **Páginas Web**
│   ├── index.html                    # 🏠 Página principal (cadastro público)
│   ├── login.html                    # 🔐 Autenticação de usuários
│   ├── painel-simples.html          # 📊 Painel administrativo completo
│   └── trocar-senha.html            # 🔑 Troca de senha obrigatória
│
├── 🎨 **Recursos Estáticos**
│   ├── css/style.css                # 🎨 Estilos responsivos
│   ├── js/script.js                 # ⚡ JavaScript principal
│   ├── js/municipios-completos.js   # 🏙️ Dados de cidades/estados
│   ├── imagem/terrabugio.jpg        # 🖼️ Logo oficial
│   └── favicon.ico, favicon.svg     # 🔖 Ícones do site
│
├── 🔧 **Sistema PHP**
│   └── php/
│       ├── api/                     # 🌐 8 APIs RESTful
│       ├── classes/Auth.php         # 🔐 Autenticação JWT
│       ├── config/                  # ⚙️ Configurações e .env
│       ├── migrations/              # 🗄️ Estrutura do banco
│       └── vendor/                  # 📦 Dependências Composer
│
├── 💾 **Exports e Backups**
│   └── exports/
│       ├── recepcaotb_FIXED_FULL_export_*.sql  # 📊 Dados completos
│       └── README_IMPORTACAO_COMPLETA.md       # 📋 Guia de importação
│
└── 📚 **Documentação**
    ├── DOCUMENTACAO_OFICIAL.md      # 📖 Documentação técnica completa
    ├── README.md                    # 📋 Este arquivo
    └── *.md                         # 📝 Guias específicos
```

---

## 👥 **Tipos de Usuário**

<table>
<tr>
<td align="center" width="33%">

### **👤 Usuário Geral**
**Operações básicas**

✅ Lançar frequências<br>
✅ Cadastrar pessoas<br>
✅ Atualizar dados<br>
❌ Relatórios<br>
❌ Gestão de usuários

</td>
<td align="center" width="33%">

### **👨‍💼 Líder**
**Gestão intermediária**

✅ Todas do usuário geral<br>
✅ **Relatórios completos**<br>
✅ **Gestão de voluntários**<br>
✅ **Frequência voluntários**<br>
❌ Gestão de usuários

</td>
<td align="center" width="33%">

### **👑 Administrador**
**Controle total**

✅ **Todas as funcionalidades**<br>
✅ **Gestão de usuários**<br>
✅ **Análise de duplicatas**<br>
✅ **Backup e restore**<br>
✅ **Configurações avançadas**

</td>
</tr>
</table>

---

## 📊 **Status do Sistema**

<div align="center">

### **🎯 Sistema em Produção - Versão 2.0**

| Componente | Status | Descrição |
|------------|--------|-----------|
| 🌐 **Frontend** | ✅ **Operacional** | Interface responsiva e moderna |
| 🔧 **Backend PHP** | ✅ **Operacional** | 8 APIs funcionais |
| 🗄️ **Banco MySQL** | ✅ **Operacional** | 4 tabelas otimizadas |
| 🔐 **Autenticação** | ✅ **Operacional** | JWT com sessões seguras |
| 📊 **Relatórios** | ✅ **Operacional** | 6 tipos com exportação |
| 💾 **Backup/Restore** | ✅ **Operacional** | Sistema automático |
| 🔍 **Análise Duplicatas** | ✅ **Operacional** | Algoritmo inteligente |
| 🤝 **Sistema Voluntários** | ✅ **Operacional** | Gestão completa |

</div>

---

## 🚀 **Deploy e Produção**

### **Checklist de Deploy**
- ✅ Servidor configurado (PHP 8.0+, MySQL 8.0+)
- ✅ Dependências instaladas via Composer
- ✅ Banco de dados importado e configurado
- ✅ Arquivo .env configurado com credenciais
- ✅ Permissões de arquivo ajustadas
- ✅ Apache mod_rewrite habilitado
- ✅ SSL/HTTPS configurado (recomendado)
- ✅ Backup automático configurado

### **Monitoramento**
```bash
# Verificar logs
tail -f /var/log/apache2/error.log

# Status do banco
mysql -u root -p -e "SELECT COUNT(*) FROM recepcaotb.pessoas;"

# Verificar sessões ativas
mysql -u root -p recepcaotb -e "SELECT COUNT(*) FROM sessoes WHERE expires_at > NOW();"
```

---

## 📈 **Métricas e Estatísticas**

<div align="center">

### **📊 Dados do Sistema** *(exemplo)*

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| 👥 **Pessoas Cadastradas** | 4.662+ | Total de registros |
| 📊 **Frequências Registradas** | 3.000+ | Histórico completo |
| 👤 **Usuários Ativos** | 8 | Administradores e operadores |
| 🤝 **Voluntários** | 150+ | Cadastros especializados |
| 📈 **Relatórios Gerados** | 500+ | Diversos tipos |
| 💾 **Backups Realizados** | 30+ | Automáticos e manuais |

</div>

---

## 🎯 **Roadmap Futuro**

### **Próximas Funcionalidades**
- 📱 **App Mobile** para registro de frequências
- 📧 **Notificações por email** automáticas
- 📊 **Dashboard** com métricas em tempo real
- 🔔 **Alertas** para administradores
- 🌐 **API pública** para integrações
- 🔐 **Autenticação 2FA** adicional

### **Melhorias Planejadas**
- ⚡ **Cache Redis** para performance
- 🔍 **Busca full-text** avançada
- 📈 **Relatórios personalizáveis**
- 🎨 **Temas customizáveis**
- 📱 **PWA** (Progressive Web App)

---

<div align="center">

## 🏆 **Sistema Terra do Bugio v2.0**

**✨ Solução completa, profissional e pronta para produção ✨**

[![Documentação](https://img.shields.io/badge/📚-Documentação_Completa-blue)](DOCUMENTACAO_OFICIAL.md)
[![Instalação](https://img.shields.io/badge/⚙️-Guia_de_Instalação-green)](GUIA_INSTALACAO.md)
[![Manual](https://img.shields.io/badge/👤-Manual_do_Usuário-orange)](GUIA_USUARIO.md)
[![APIs](https://img.shields.io/badge/🌐-Referência_APIs-purple)](API_REFERENCE.md)

---

**© 2025 Terra do Bugio - Sistema de Gestão Administrativo**

*Desenvolvido com ❤️ para a comunidade Terra do Bugio*

</div>
