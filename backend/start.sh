#!/bin/sh
set -e

# Cargar variables de entorno del archivo .env
if [ -f /app/.env ]; then
  set -a
  . /app/.env
  set +a
fi

echo "Running database migrations..."
npx prisma migrate deploy
echo "Starting server..."
exec node dist/main.js
