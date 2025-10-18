# Diagnóstico das APIs - Problemas Identificados

## 🔍 Problemas Encontrados:

### 1. **Rota GET /api/pessoas/:id NÃO EXISTE**
- **Problema**: Sistema não tem rota para buscar pessoa por ID específico
- **Erro**: 404 Not Found
- **Impacto**: Frontend não consegue carregar dados de pessoa específica para edição
- **Solução**: Implementar rota GET /api/pessoas/:id

### 2. **API de Frequências com Validação Incorreta**
- **Problema**: Erro "Pessoa, tipo e data são obrigatórios" mesmo com dados corretos
- **Causa**: Validação pode estar verificando campos com nomes diferentes
- **Impacto**: Não consegue criar novas frequências
- **Solução**: Verificar e corrigir validações na API de frequências

### 3. **Estrutura de Rotas Inconsistente**
- **Problema**: Algumas rotas estão no server.js, outras em arquivos separados
- **Rota PUT pessoas**: Está no server.js (linha 127)
- **Rota GET pessoas**: Está no pessoas.js
- **Impacto**: Confusão na manutenção e possíveis conflitos

## ✅ Funcionalidades que Estão Funcionando:

1. **Login e Autenticação**: ✅ OK
2. **Listagem de Pessoas**: ✅ OK (4.663 registros)
3. **Busca por Nome**: ✅ OK
4. **Edição de Pessoas**: ✅ OK (PUT funciona)
5. **Listagem de Frequências**: ✅ OK (2.998 registros)
6. **Listagem de Usuários**: ✅ OK (8 usuários)
7. **Filtros de Data**: ✅ OK

## 🎯 Correções Necessárias:

1. Implementar rota GET /api/pessoas/:id
2. Corrigir validações na API de frequências
3. Reorganizar rotas para consistência
4. Adicionar validações de entrada mais robustas
