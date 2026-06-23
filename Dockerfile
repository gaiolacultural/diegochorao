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

# Exigir variáveis durante o build para o Next.js não crachar
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

ARG RESEND_API_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY

# Copiar todo o resto do projeto
COPY . .

# Construir o projeto Next.js
RUN npm run build

# Expor a porta 3000 (a mesma porta que configuramos no Easypanel)
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar o servidor de produção do Next.js, mantendo o container vivo em caso de falha
CMD ["/bin/sh", "-c", "npm start || tail -f /dev/null"]
