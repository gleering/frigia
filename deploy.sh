#!/bin/bash
# deploy.sh — Deploy Frigia a Hostinger VPS
# Corré este script desde TU MÁQUINA (no desde el servidor)
#
# Uso: bash deploy.sh
# Requiere: ssh, sshpass (brew install sshpass / apt install sshpass)

set -e

# ─── CONFIG ───────────────���─────────────────────────────────��─────────────────
SSH_USER="u473339556"
SSH_HOST="46.202.183.176"
SSH_PORT="65002"
SSH_PASS="15590325_Jesus"

APP_DIR="/home/$SSH_USER/frigia"
REPO_URL="https://github.com/gleering/frigia.git"
BRANCH="claude/perfume-shop-store-nUdUC"
APP_PORT="3000"
DOMAIN="deepskyblue-lark-563980.hostingersite.com"

# ─── ENV VARS para producción (editá antes de correr) ─────────────────────────
DB_URL="postgresql://neondb_owner:npg_yuvbYLA2VSQ7@ep-withered-lab-anoofywj-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
ADMIN_SECRET="frigia-admin-$(date +%s | sha256sum | head -c 12)"
WHATSAPP="5492364000000"
BASE_URL="https://$DOMAIN"
ANTHROPIC_KEY="${ANTHROPIC_API_KEY:-}"  # pasalo como variable de entorno

# ─── HELPERS ────────────────────────────────────────────────────────���─────────
SSH_CMD="sshpass -p '$SSH_PASS' ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SSH_USER@$SSH_HOST"

run_remote() {
  eval "$SSH_CMD '$1'"
}

echo "🚀 Deploying Frigia → $SSH_HOST:$SSH_PORT"
echo ""

# ─── 1. Verificar servidor ──────────────────────────────────────────────────���─
echo "1. Verificando servidor…"
NODE_VERSION=$(run_remote "node --version 2>/dev/null || echo 'no node'")
NPM_VERSION=$(run_remote "npm --version 2>/dev/null || echo 'no npm'")
PM2_VERSION=$(run_remote "pm2 --version 2>/dev/null || echo 'no pm2'")

echo "   node: $NODE_VERSION"
echo "   npm:  $NPM_VERSION"
echo "   pm2:  $PM2_VERSION"

# Instalar Node.js si no está
if [[ "$NODE_VERSION" == "no node" ]]; then
  echo "   Instalando Node.js 20 LTS…"
  run_remote "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
fi

# Instalar PM2 si no está
if [[ "$PM2_VERSION" == "no pm2" ]]; then
  echo "   Instalando PM2…"
  run_remote "npm install -g pm2"
fi

# ─── 2. Clonar o actualizar repo ───────────────────────────────��──────────────
echo ""
echo "2. Actualizando código…"
run_remote "
  if [ -d $APP_DIR ]; then
    cd $APP_DIR && git fetch origin && git checkout $BRANCH && git pull origin $BRANCH
  else
    git clone -b $BRANCH $REPO_URL $APP_DIR
  fi
"

# ─── 3. Crear .env.local ────────────────────────────────���─────────────────────
echo ""
echo "3. Configurando variables de entorno…"
run_remote "cat > $APP_DIR/.env.local << 'ENVEOF'
DATABASE_URL=$DB_URL
ADMIN_SECRET=$ADMIN_SECRET
NEXT_PUBLIC_WHATSAPP_NUMBER=$WHATSAPP
NEXT_PUBLIC_BASE_URL=$BASE_URL
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
RESEND_API_KEY=re_placeholder
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=frigia
ENVEOF"

echo "   ADMIN_SECRET generado: $ADMIN_SECRET"
echo "   ⚠️  Guardá este valor para acceder al admin en /admin/login"

# ─── 4. Instalar dependencias ────────────────────────────────────────────────���
echo ""
echo "4. Instalando dependencias…"
run_remote "cd $APP_DIR && npm ci --omit=dev 2>&1 | tail -3"

# ─── 5. Migrar base de datos ──────────────────────────────────────────────────
echo ""
echo "5. Migrando base de datos…"
run_remote "cd $APP_DIR && npx prisma migrate deploy 2>&1"

# ─── 6. Seed: 100 productos ───────────────────────────────��───────────────────
echo ""
echo "6. ¿Importar los 100 productos del CSV? (s/N)"
read -r answer
if [[ "$answer" == "s" || "$answer" == "S" ]]; then
  echo "   Copiando CSV al servidor…"
  sshpass -p "$SSH_PASS" scp -P $SSH_PORT -o StrictHostKeyChecking=no \
    "./Articulos.csv" "$SSH_USER@$SSH_HOST:$APP_DIR/Articulos.csv"
  echo "   Ejecutando seed (puede tardar 5-10 min por Batch API)…"
  run_remote "cd $APP_DIR && npx tsx scripts/seed-top100.ts ./Articulos.csv"
fi

# ─── 7. Build ─────────────────────────────────────────────────────────────────
echo ""
echo "7. Buildando Next.js…"
run_remote "cd $APP_DIR && npm run build 2>&1 | tail -20"

# ─── 8. Iniciar con PM2 ───────────────────────────────────────────────────────
echo ""
echo "8. Iniciando con PM2…"
run_remote "
  cd $APP_DIR
  pm2 stop frigia 2>/dev/null || true
  pm2 delete frigia 2>/dev/null || true
  pm2 start npm --name frigia -- start -- --port $APP_PORT
  pm2 save
  pm2 startup 2>/dev/null || true
"

# ─── 9. Estado final ───────────────────────────────────────────────────���──────
echo ""
echo "✅ Deploy completo!"
echo ""
echo "   App corriendo en: http://$SSH_HOST:$APP_PORT"
echo "   Admin panel:      http://$SSH_HOST:$APP_PORT/admin/login"
echo "   ADMIN_SECRET:     $ADMIN_SECRET"
echo ""
echo "   Para ver logs: sshpass -p '$SSH_PASS' ssh -p $SSH_PORT $SSH_USER@$SSH_HOST 'pm2 logs frigia'"
