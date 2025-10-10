# Use a imagem Node.js 18
FROM node:18-alpine

# Crie o diretório da aplicação
WORKDIR /usr/src/app

# Instale as dependências necessárias para o build
RUN apk add --no-cache python3 make g++

# Instale as dependências da aplicação
COPY package*.json ./
RUN npm ci --only=production

# Copie o código-fonte da aplicação
COPY . .

# Exponha a porta 10000
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
