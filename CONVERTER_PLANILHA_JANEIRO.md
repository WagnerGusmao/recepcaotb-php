# 📋 CONVERTER PLANILHA PARA PROCESSAR JANEIRO

## Passo 1: Converter Excel para CSV

1. **Abra** o arquivo `Setembro_Freq.xlsm` no Excel
2. **Salve como CSV**:
   - Arquivo → Salvar Como
   - Tipo: **CSV (separado por vírgulas)** ou **CSV UTF-8**
   - Nome: `frequencias_completas.csv`
   - Salve na pasta `backend`

## Passo 2: Analisar Janeiro

```bash
cd backend
node analisar_janeiro.js frequencias_completas.csv
```

Isso mostrará:
- Quantas pessoas têm frequência em janeiro
- Quantas frequências serão criadas (deve ser ~308)
- Confirmação antes de importar

## Passo 3: Importar Janeiro

```bash
node importar_janeiro.js frequencias_completas.csv
```

## O que será feito:

✅ **Buscar coluna "Janeiro"** na planilha
✅ **Processar apenas pessoas** que têm valor na coluna janeiro
✅ **Data fixa**: 12/01/2025 para todas as frequências
✅ **Tipo**: Comum para todas
✅ **Senhas**: Sequenciais (001, 002, 003...)
✅ **Criar pessoas novas** se não existirem no banco

## Resultado Esperado:
- ~308 frequências de janeiro criadas
- Data: 12/01/2025
- Senhas: 001 a 308

Após converter o arquivo, execute os comandos acima!