const loadEnv = require("./loadEnv");
const { PrismaClient } = require("@prisma/client");

loadEnv();

const prisma = new PrismaClient();

module.exports = prisma;
