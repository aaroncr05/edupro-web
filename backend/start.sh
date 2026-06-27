#!/bin/sh
set -e

echo "=== ENV CHECK ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL: SET"
else
  echo "DATABASE_URL: NOT SET - trying .env file"
  if [ -f /app/.env ]; then
    echo ".env file found, loading..."
    set -a
    . /app/.env
    set +a
    echo "DATABASE_URL after load: $([ -n "$DATABASE_URL" ] && echo SET || echo STILL NOT SET)"
  else
    echo ".env file not found at /app/.env"
  fi
fi
echo "================="

echo "Running database migrations..."
npx prisma migrate deploy
echo "Starting server..."
exec node dist/main.js
