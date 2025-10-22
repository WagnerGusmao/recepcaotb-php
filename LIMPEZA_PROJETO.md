# 🧹 Plano de Limpeza do Projeto

**Data**: 22/10/2025

## Arquivos Identificados para Remoção

### 1️⃣ Arquivos de Teste e Debug (Remover)
- `test_api_voluntarios.php` - Teste temporário de API
- `test_db.php` - Teste de conexão com BD
- `test_frequencia.php` - Teste de frequência
- `debug_login.php` - Debug de login
- `testar_login_direto.php` - Teste de login
- `testar_mysqldump.php` - Teste de mysqldump

### 2️⃣ Backups Antigos (Manter apenas o mais recente)
- `backups/recepcaotb_backup_2025-10-22_192310.sql` ❌ Remover (antigo)
- `backups/recepcaotb_backup_2025-10-22_202736.sql` ✅ Manter (mais recente)

### 3️⃣ Exports Antigos (Manter apenas o mais recente)
- `exports/recepcaotb_EXPORT_COMPLETO_2025-10-18_12-27-48.sql` ❌ Remover
- `exports/recepcaotb_EXPORT_COMPLETO_2025-10-20_22-18-10.sql` ✅ Manter

### 4️⃣ Scripts de Setup/Manutenção (Avaliar)
- `create_admin.php` - Útil para criar admin (MANTER)
- `create_database.php` - Útil para setup inicial (MANTER)
- `resetar_senha_admin.php` - Útil para recuperação (MANTER)
- `setup_tables.php` - Útil para setup inicial (MANTER)
- `importar_backup.php` - Útil para restauração (MANTER)
- `gerar_export_completo.php` - Útil para backup (MANTER)

### 5️⃣ Scripts Temporários (Remover)
- `buscar_pessoas.php` - Script temporário
- `corrigir_tabela_sessoes.php` - Correção já aplicada
- `create_frequencia_voluntarios.php` - Já criado
- `criar_rate_limits_simples.php` - Já aplicado
- `verificar_duplicatas_voluntarios.php` - Script de manutenção pontual
- `resetar_e_importar_bd.php` - Script duplicado de importação
- `importar_bd.php` - Script duplicado de importação

### 6️⃣ Documentação Duplicada/Debug (Consolidar)
- `ANALISE_TECNICA_COMPLETA.md` - Consolidar no README
- `BUSCA_AUTOMATICA_VOLUNTARIO.md` - Feature já implementada
- `CORRECAO_ERRO_TROCAR_SENHA.md` - Debug antigo
- `CORRECAO_LISTA_USUARIOS.md` - Debug antigo
- `CORRECOES_APLICADAS.md` - Debug antigo
- `DEBUG_FREQUENCIA.md` - Debug antigo
- `DIAGNOSTICO_VOLUNTARIOS.md` - Debug antigo
- `HABILITAR_GD.md` - Consolidar em GUIA_INSTALACAO
- `PERMISSOES_LIDER_COMPLETAS.md` - Consolidar na documentação
- `PERMISSOES_LISTA_USUARIOS.md` - Consolidar na documentação
- `RESTRICAO_PERMISSOES_LIDER.md` - Consolidar na documentação
- `TROUBLESHOOTING_LISTA_USUARIOS.md` - Consolidar em GUIA_INSTALACAO

### 7️⃣ Documentação Principal (MANTER)
- `README.md` - Documentação principal
- `COMECE_AQUI.md` - Guia inicial
- `COMO_INICIAR.md` - Guia de inicialização
- `COMO_IMPORTAR_BACKUP.md` - Guia de backup
- `GUIA_INSTALACAO.md` - Guia de instalação
- `GUIA_USUARIO.md` - Guia do usuário
- `API_REFERENCE.md` - Referência da API
- `DOCUMENTACAO_OFICIAL.md` - Documentação oficial
- `PLANO_ACAO_PRIORITARIO.md` - Plano atual

### 8️⃣ Arquivos SQL Temporários (Remover)
- `criar_rate_limits.sql` - Já aplicado

## Resumo da Limpeza

### Arquivos a Remover: 24 arquivos
### Espaço a Liberar: ~3.5 MB
### Impacto: Nenhum - arquivos temporários e de debug

## ✅ Limpeza Concluída

### Arquivos Removidos:
1. **Arquivos de Teste (6 arquivos)**:
   - test_api_voluntarios.php
   - test_db.php
   - test_frequencia.php
   - debug_login.php
   - testar_login_direto.php
   - testar_mysqldump.php

2. **Scripts Temporários (8 arquivos)**:
   - buscar_pessoas.php
   - corrigir_tabela_sessoes.php
   - create_frequencia_voluntarios.php
   - criar_rate_limits_simples.php
   - verificar_duplicatas_voluntarios.php
   - resetar_e_importar_bd.php
   - importar_bd.php
   - criar_rate_limits.sql

3. **Backups Antigos (1 arquivo - 916 KB)**:
   - backups/recepcaotb_backup_2025-10-22_192310.sql

4. **Exports Antigos (1 arquivo - 1.13 MB)**:
   - exports/recepcaotb_EXPORT_COMPLETO_2025-10-18_12-27-48.sql

5. **Documentação de Debug (13 arquivos)**:
   - ANALISE_TECNICA_COMPLETA.md
   - BUSCA_AUTOMATICA_VOLUNTARIO.md
   - CORRECAO_ERRO_TROCAR_SENHA.md
   - CORRECAO_LISTA_USUARIOS.md
   - CORRECOES_APLICADAS.md
   - DEBUG_FREQUENCIA.md
   - DIAGNOSTICO_VOLUNTARIOS.md
   - HABILITAR_GD.md
   - PERMISSOES_LIDER_COMPLETAS.md
   - PERMISSOES_LISTA_USUARIOS.md
   - RESTRICAO_PERMISSOES_LIDER.md
   - TROUBLESHOOTING_LISTA_USUARIOS.md
   - PLANO_REFATORACAO_ARQUITETURA.md

### Total Removido: 29 arquivos (~2.5 MB)

## ✅ Estrutura Final do Projeto

### Arquivos Principais Mantidos:
- **Core**: index.html, login.html, trocar-senha.html, painel-simples.html
- **Configuração**: .env, .env.example, .htaccess, .gitignore
- **Setup**: create_admin.php, create_database.php, setup_tables.php
- **Utilitários**: resetar_senha_admin.php, importar_backup.php, gerar_export_completo.php
- **Scripts**: iniciar_local.bat, router_local.php, run_migration.php
- **Documentação Essencial**: 
  - README.md
  - COMECE_AQUI.md
  - COMO_INICIAR.md
  - COMO_IMPORTAR_BACKUP.md
  - GUIA_INSTALACAO.md
  - GUIA_USUARIO.md
  - API_REFERENCE.md
  - DOCUMENTACAO_OFICIAL.md
  - PLANO_ACAO_PRIORITARIO.md

### Estrutura de Diretórios:
- **php/api/** - 8 endpoints funcionais
- **php/config/** - 3 arquivos de configuração
- **php/classes/** - Classes principais
- **php/migrations/** - Migrações de BD
- **backups/** - 1 backup mais recente
- **exports/** - 1 export mais recente
- **css/** - Estilos
- **js/** - Scripts JavaScript
- **imagem/** - Recursos visuais

## 🎯 Resultado
✅ Projeto limpo e organizado
✅ Integridade mantida
✅ Apenas arquivos essenciais
✅ Documentação consolidada
✅ Sistema 100% funcional
