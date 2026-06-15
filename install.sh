#!/bin/bash

set -e

echo "🚀 FULL SaaS PRODUCTION INSTALLER STARTING..."

# =========================
# CONFIG
# =========================
REPO_URL="https://github.com/mehdidelghavi/3xui_telegram_bot.git"
PROJECT_DIR="xui_bot"
NODE_VERSION="20"

read -p "🌐 Enter your domain (example.com): " DOMAIN
read -p "📧 Enter email for SSL: " EMAIL

# =========================
# 1. SYSTEM UPDATE
# =========================
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# =========================
# 2. INSTALL DEPENDENCIES
# =========================
echo "📦 Installing dependencies..."
sudo apt install -y git curl nginx mysql-server build-essential

# =========================
# 3. NODEJS INSTALL
# =========================
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs

node -v
npm -v

# =========================
# 4. PM2 INSTALL
# =========================
echo "📦 Installing PM2..."
sudo npm install -g pm2

# =========================
# 5. CLONE PROJECT
# =========================
echo "📥 Cloning project..."

if [ -d "$PROJECT_DIR" ]; then
    cd $PROJECT_DIR
    git pull
else
    git clone $REPO_URL $PROJECT_DIR
    cd $PROJECT_DIR
fi

# =========================
# 6. INSTALL NODE MODULES
# =========================
echo "📦 Installing npm packages..."
npm install

# =========================
# 7. MYSQL SETUP
# =========================
echo "🗄️ Setting up MySQL..."

read -p "DB NAME: " DB_NAME
read -p "DB USER: " DB_USER
read -p "DB PASSWORD: " DB_PASS
read -p "MySQL root password (press enter if none): " ROOT_PASS

# sanitize DB name
DB_NAME=$(echo "$DB_NAME" | tr -cd 'a-zA-Z0-9_')
if [[ ! "$DB_NAME" =~ ^[a-zA-Z0-9_]+$ ]]; then
  echo "❌ Invalid DB name"
  exit 1
fi

MYSQL_CMD="mysql -u root"

if [ ! -z "$ROOT_PASS" ]; then
    MYSQL_CMD="mysql -u root -p$ROOT_PASS"
fi

$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ MySQL setup completed!"

# =========================
# 8. MYSQL START
# =========================
sudo systemctl enable mysql
sudo systemctl start mysql

# =========================
# 9. ENV SETUP (FIXED)
# =========================
echo "⚙️ Setting .env..."

cp .env.example .env

DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"

read -p "Notebook_Channel_Id: " Notebook_CHANNEL_ID
read -p "BOT_TOKEN: " BOT_TOKEN
read -p "SELLBOT_TOKEN: " SELLBOT_TOKEN

sed -i "s|Notebook_Channel_Id=.*|Notebook_Channel_Id=$Notebook_CHANNEL_ID|" .env
sed -i "s|SELLBOT_TOKEN=.*|SELLBOT_TOKEN=$SELLBOT_TOKEN|" .env
sed -i "s|BOT_TOKEN=.*|BOT_TOKEN=$BOT_TOKEN|" .env
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
sed -i "s|DATABASE_USER=.*|DATABASE_USER=$DB_USER|" .env
sed -i "s|DATABASE_PASSWORD=.*|DATABASE_PASSWORD=$DB_PASS|" .env
sed -i "s|DATABASE_DBNAME=.*|DATABASE_DBNAME=$DB_NAME|" .env

# =========================
# 10. PRISMA SETUP (FIXED ORDER)
# =========================
echo "🧬 Prisma setup..."
npx prisma generate
npx prisma migrate deploy

# =========================
# 11. PM2 START
# =========================
echo "🚀 Starting bot with PM2..."

pm2 stop all || true
pm2 delete all || true

pm2 start app.js --name "xui-bot"
pm2 save

pm2 startup systemd -u $USER --hp $HOME || true

# =========================
# 12. NGINX CONFIG
# =========================
echo "🌐 Configuring Nginx..."

sudo tee /etc/nginx/sites-available/xui_bot > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/xui_bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# =========================
# 13. SSL (LET'S ENCRYPT)
# =========================
echo "🔐 Installing SSL..."

sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# =========================
# 14. SETUP ADMIN 
# =========================

echo "Enter Admin Telegram Chat ID:"
read ADMIN_CHAT_ID

echo "Enter Admin Username For Panel:"
read ADMIN_USERNAME

echo "Enter Admin Password For Panel:"
read ADMIN_PASSWORD

node setup-admin.js "$ADMIN_CHAT_ID" "$ADMIN_USERNAME" "$ADMIN_PASSWORD"

# =========================
# 15. DONE
# =========================
echo "✅ INSTALLATION COMPLETE!"
echo "🚀 Bot running with PM2"
echo "🌐 Domain: https://$DOMAIN"
echo "📊 PM2 status: pm2 status"
echo "📜 Logs: pm2 logs xui-bot"