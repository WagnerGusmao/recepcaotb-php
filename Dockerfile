# Use a imagem Node.js 18 com Alpine
FROM node:18-alpine

# Crie o diretório da aplicação
WORKDIR /usr/src/app

# Instale as dependências necessárias para o build e para o sqlite3
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    && npm config set python /usr/bin/python3

# Instale as dependências da aplicação
COPY package*.json ./
RUN npm ci --only=production

# Copie o código-fonte da aplicação
COPY . .

# Crie o diretório para o banco de dados
RUN mkdir -p /usr/src/app/backend/db

# Exponha a porta 10000
EXPOSE 10000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
