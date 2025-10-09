# Instruções para Execução

## 1. Instalar Dependências
```bash
cd backend
npm install
```

## 2. Executar Carga Inicial
```bash
cd backend
npm run carga-inicial
```

## 3. Iniciar o Servidor
```bash
cd backend
npm start
```

## 4. Abrir o Frontend
Abra o arquivo `index.html` no navegador.

## Mudanças Implementadas

### Estrutura do Cadastro Atualizada:
- **Nome** (obrigatório)
- **CPF** (opcional, com validação)
- **Sexo** (opcional)
- **Data de Nascimento** (opcional)
- **Cidade** (opcional)
- **Estado** (opcional, 2 caracteres)
- **Telefone** (opcional)
- **E-mail** (opcional, com validação)
- **Indicação** (opcional): Amigos/Parentes, Curso Terra do Bugio, Facebook, Instagram, Mercado Místico, Rádio Atual, TV Astral, Youtube

### Carga Inicial:
- Arquivo `data/setembro.csv` criado com dados de exemplo
- Script `backend/carga-inicial.js` para importar dados
- Aceita campos em branco conforme solicitado

### Banco de Dados:
- Tabela `pessoas` atualizada com nova estrutura
- Campos opcionais permitem valores NULL
- Removidos campos de endereço desnecessários