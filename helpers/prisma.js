const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require('@prisma/client');
require("dotenv").config();
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DBNAME,
    connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;