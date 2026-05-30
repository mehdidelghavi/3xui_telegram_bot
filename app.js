const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const path = require('path');
const { Telegraf } = require("telegraf");
const adminBotApi = new Telegraf(process.env.BOT_TOKEN);
const adminBot = require("./controllers/admin");
const { globalErrorHandler } = require("./helpers/errorHandler");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

adminBot.bot(adminBotApi);

globalErrorHandler();

app.listen(process.env.PORT, (err) => {
    console.log(`App is Running on Port ${process.env.PORT} `);
});