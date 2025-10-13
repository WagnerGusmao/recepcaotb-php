# Use a imagem Node.js 18 com Alpine
FROM node:18-alpine

# Atualize os repositórios e instale as dependências do sistema
RUN apk update && apk upgrade && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pkgconfig \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    giflib \
    libpng \
    pango \
    cairo \
    gcc \
    musl-dev

# Configure o Python 3 como o interpretador padrão
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Crie o diretório da aplicação
WORKDIR /usr/src/app

# Instale as dependências da aplicação
COPY package*.json ./
RUN npm config set python /usr/bin/python3 && \
    npm ci --only=production --no-optional

# Copie o código-fonte da aplicação
COPY . .

# Crie o diretório para o banco de dados
RUN mkdir -p /usr/src/app/backend/db

# Configure as permissões
RUN chmod -R 777 /usr/src/app/backend/db

# Exponha a porta 10000
EXPOSE 10000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=10000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
