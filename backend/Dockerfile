FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl python3 make g++

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY start.sh ./
RUN chmod +x start.sh

# Recibir variables de entorno como build args
ARG DATABASE_URL
ARG JWT_SECRET
ARG NODE_ENV=production
ARG PORT=3001
ARG CORS_ORIGIN
ARG API_URL
ARG COOKIE_DOMAIN
ARG RESEND_API_KEY

# Escribir .env en la imagen para que esté disponible en runtime
RUN echo "DATABASE_URL=${DATABASE_URL}" > /app/.env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> /app/.env && \
    echo "NODE_ENV=${NODE_ENV}" >> /app/.env && \
    echo "PORT=${PORT}" >> /app/.env && \
    echo "CORS_ORIGIN=${CORS_ORIGIN}" >> /app/.env && \
    echo "API_URL=${API_URL}" >> /app/.env && \
    echo "COOKIE_DOMAIN=${COOKIE_DOMAIN}" >> /app/.env && \
    echo "RESEND_API_KEY=${RESEND_API_KEY}" >> /app/.env

EXPOSE 3001
CMD ["sh", "start.sh"]
