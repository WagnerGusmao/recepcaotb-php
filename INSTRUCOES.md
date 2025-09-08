# Sistema de Frequência - Instruções de Instalação

## Pré-requisitos
- Node.js instalado (versão 14 ou superior)

## Instalação do Backend

1. Abra o terminal na pasta `backend`:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em: http://localhost:3000

## Executar o Frontend

1. Abra o arquivo `index.html` no navegador
2. Certifique-se de que o backend está rodando

## Estrutura do Banco de Dados

### Tabela `pessoas`
- id (PRIMARY KEY)
- nome, cpf (UNIQUE), nascimento, sexo
- cep, rua, numero, complemento, bairro, cidade, estado
- telefone, email
- created_at

### Tabela `frequencias`
- id (PRIMARY KEY)
- pessoa_id (FOREIGN KEY)
- tipo, numero_senha, data
- created_at

## APIs Disponíveis

- `POST /api/pessoas` - Cadastrar pessoa
- `GET /api/pessoas?busca=termo` - Buscar pessoas
- `POST /api/frequencias` - Registrar frequência
- `GET /api/frequencias?dataInicio&dataFim&tipo` - Buscar frequências

## Funcionalidades

✅ Cadastro com validação de CPF único
✅ Busca por nome ou CPF
✅ Registro de frequência com senha
✅ Relatórios filtrados e ordenados
✅ Banco de dados SQLite persistente
✅ APIs RESTful completas