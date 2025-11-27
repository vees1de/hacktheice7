#!/bin/bash
set -e

FRONT_DIR="/root/hacktheice7/frontend"
WWW_DIR="/var/www/bims14"

cd "$FRONT_DIR"

npm ci --silent
npm run build

rm -rf "$WWW_DIR"
mkdir -p "$WWW_DIR"
cp -r dist/* "$WWW_DIR"

chown -R www-data:www-data "$WWW_DIR"

nginx -t && systemctl reload nginx

echo "✅ Статика обновлена в $WWW_DIR"
