# Instruções para Importar Frequências Mensais

## Passo 1: Converter Excel para CSV

1. Abra o arquivo `Setembro_Freq.xlsm` no Excel
2. Verifique a estrutura da planilha:
   - Primeira coluna: Nome da pessoa
   - Segunda coluna: CPF (se houver)
   - Demais colunas: Datas de frequência do mês

3. Salve como CSV:
   - Arquivo → Salvar Como
   - Tipo: CSV (separado por vírgulas) ou CSV (separado por ponto e vírgula)
   - Nome: `setembro_freq.csv`
   - Salve na pasta `backend`

## Passo 2: Executar Importação

```bash
cd backend
node processar_frequencia_mensal.js setembro_freq.csv
```

## Formato Esperado do CSV

```
Nome,CPF,01,02,03,04,05,...,30
João Silva,12345678901,X,,X,X,,,X
Maria Santos,,X,X,,X,X,X,
```

Onde:
- X ou qualquer valor = presença naquele dia
- Vazio = ausência
- Colunas de datas podem ser números (1,2,3...) ou datas (01/09, 02/09...)

## Script Criado

O script `processar_frequencia_mensal.js` irá:
1. Ler o arquivo CSV
2. Para cada pessoa, buscar no banco de dados
3. Se não encontrar, criar novo cadastro
4. Registrar frequência para cada data marcada
5. Mostrar relatório do processamento

## Verificação

Após a importação, verifique no sistema:
- Seção Relatórios
- Filtrar por setembro/2024
- Conferir se as frequências foram registradas corretamente