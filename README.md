# 🚀 3XUI Telegram Bot

A powerful Telegram bot for managing and integrating multiple XUI-based panels such as:

- 3X-UI
- Marzban
- Marzneshin
- Hiddify

This bot provides a unified interface to manage users, services, traffic, and server configurations directly from Telegram.

---

# ⚡ One-Line Installation (Recommended)

Run the following command on your Linux server:

```bash
bash <(curl -Ls https://raw.githubusercontent.com/mehdidelghavi/3xui_telegram_bot/main/install.sh)
```

This will automatically:

- Install Node.js
- Install MySQL
- Install Nginx
- Setup PM2
- Clone the repository
- Install dependencies
- Configure environment variables
- Setup Prisma database
- Configure SSL (if domain is provided)
- Start the bot automatically

---

# 📦 Manual Installation

If you prefer manual setup:

```bash
git clone https://github.com/mehdidelghavi/3xui_telegram_bot.git
cd 3xui_telegram_bot
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
node app.js
```

---

# ⚙️ Environment Variables

The installer will ask you for these values:

| Variable | Description |
|----------|------------|
| BOT_TOKEN | Telegram bot token |
| DATABASE_URL | MySQL connection string |
| Notebook_Channel_Id | Channel ID for logs/orders |

Example:

```env
BOT_TOKEN=123456:ABCDEF
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
Notebook_Channel_Id=-100123456789
```

---

# 🧠 Features

## 👤 User Management
- Create / update users
- Track traffic usage
- Manage subscription time

## 🖥 Server Integration
- Multi-server support
- XUI API integration
- Real-time sync

## 📊 Service System
- Service creation
- Inbound binding
- Plan management

## 💬 Telegram Features
- Inline keyboards
- Step-by-step flows
- Admin panel inside Telegram

## 🧾 Notebook System
- Store client records
- Message tracking
- Admin logs

---

# 🛠 Tech Stack

- Node.js
- Telegraf.js
- Prisma ORM
- MySQL
- Nginx
- PM2

---

# 🚀 Production Deployment

Recommended setup:

- Ubuntu 20+
- Node.js 20+
- MySQL 8+
- Nginx reverse proxy
- PM2 process manager

---

# 🔐 Security Notes

- Do NOT expose `.env` file
- Use strong MySQL password
- Enable firewall (UFW recommended)
- Use SSL (auto-installed by script if domain provided)

---

# 📊 Process Management

Check bot status:

```bash
pm2 status
```

View logs:

```bash
pm2 logs xui-bot
```

Restart bot:

```bash
pm2 restart xui-bot
```

---

# 📡 Updates

To update project:

```bash
cd xui_bot
git pull
npm install
npx prisma generate
pm2 restart xui-bot
```

---

# 👨‍💻 Author

Mehdi Dalghavi

---

# 📜 License

ISC Lic