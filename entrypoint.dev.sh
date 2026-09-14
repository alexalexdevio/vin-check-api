#!/bin/sh
set -e

echo "[entrypoint.dev] generating Prisma client..."
npx prisma generate

echo "[entrypoint.dev] applying migrations..."
npx prisma migrate deploy

echo "[entrypoint.dev] starting app..."
exec "$@"
