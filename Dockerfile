# Use a imagem Node.js 18
FROM node:18-alpine

# Crie o diretório da aplicação
WORKDIR /usr/src/app

# Instale as dependências da aplicação
COPY package*.json ./
RUN npm install

# Instale as dependências do backend
WORKDIR /usr/src/app/backend
COPY backend/package*.json ./
RUN npm install

# Copie o código-fonte da aplicação
WORKDIR /usr/src/app
COPY . .

# Exponha a porta 10000
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
