FROM node:20-alpine
WORKDIR /app

# Instalar pacotes essenciais para o Prisma rodar no Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar a pasta do banco de dados e gerar o Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Exigir a URL do banco durante o build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copiar todo o resto do projeto
COPY . .

# Construir o projeto Next.js
RUN npm run build

# Expor a porta 3000 (a mesma porta que configuramos no Easypanel)
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar o servidor de produção do Next.js rodando o Prisma DB Push antes
CMD ["/bin/sh", "-c", "npx prisma db push && npm start"]
