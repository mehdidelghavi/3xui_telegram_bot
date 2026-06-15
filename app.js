const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
require("dotenv").config();
const bodyParser = require("body-parser");
const path = require('path');
const { Telegraf } = require("telegraf");
const adminBotApi = new Telegraf(process.env.BOT_TOKEN);
const sellBotApi = new Telegraf(process.env.SELLBOT_TOKEN);
const adminBot = require("./controllers/admin");
const sellbot = require("./controllers/sell");
const { globalErrorHandler } = require("./helpers/errorHandler");
const app = express();
const panelRouter = require("./routes/panel");
const engine = require('ejs-mate');
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./helpers/prisma");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: false,
            dbRecordIdFunction: undefined
        }
    ),
    cookie: {
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.failed = req.flash('failed');
    res.locals.user = req.session.user || null;
    next();
});
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


adminBot.bot(adminBotApi);
sellbot.sellBot(sellBotApi);

globalErrorHandler();

app.use(panelRouter);

app.listen(process.env.PORT, (err) => {
    console.log(`App is Running on Port ${process.env.PORT} `);
});