# Sistema de Cadastro e Frequência

Sistema web completo para cadastro de pessoas e controle de frequência com backend Node.js e banco de dados SQLite.

## Funcionalidades

### 1. Cadastro de Pessoas
- **Dados Pessoais**: Nome, CPF, data de nascimento, sexo
- **Endereço**: CEP, rua, número, bairro, cidade, estado
- **Contato**: Telefone e e-mail
- Máscaras automáticas para CPF e telefone
- Validação de CPF único
- Busca automática de endereço por CEP

### 2. Controle de Frequência
- Busca por nome ou CPF
- Quatro tipos de presença:
  - **Comum**: Presença normal
  - **Hospital**: Presença em hospital
  - **Hospital Acompanhante**: Acompanhando alguém no hospital
  - **Pet**: Presença relacionada a pet
- Número de senha obrigatório
- Data automática (atual) ou manual

### 3. Relatórios
- Filtros por período (data início/fim)
- Filtro por tipo de presença
- Visualização com cores diferentes por tipo
- Ordenação por data de registro

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)

### Backend
1. Navegue até a pasta backend:
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

### Frontend
1. Abra o arquivo `index.html` no navegador
2. Certifique-se de que o backend está rodando

## Estrutura do Projeto

```
Sistema_Frequencia/
├── backend/
│   ├── server.js           # Servidor Express
│   ├── database.js         # Configuração do banco
│   ├── package.json        # Dependências
│   └── frequencia.db       # Banco SQLite
├── css/
│   └── style.css           # Estilos
├── js/
│   └── script.js           # Frontend JavaScript
├── index.html              # Página principal
├── .gitignore              # Arquivos ignorados
└── README.md               # Este arquivo
```

## Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3 (design responsivo)
- JavaScript (ES6+)
- Fetch API para comunicação com backend

### Backend
- Node.js
- Express.js
- SQLite3
- CORS habilitado

## APIs Disponíveis

- `POST /api/pessoas` - Cadastrar pessoa
- `GET /api/pessoas?busca=termo` - Buscar pessoas
- `POST /api/frequencias` - Registrar frequência
- `GET /api/frequencias?dataInicio&dataFim&tipo` - Buscar frequências

## Banco de Dados

### Tabela `pessoas`
- id, nome, cpf (único), nascimento, sexo
- cep, rua, numero, complemento, bairro, cidade, estado
- telefone, email, created_at

### Tabela `frequencias`
- id, pessoa_id (FK), tipo, numero_senha, data, created_at