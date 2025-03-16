const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();  // ✅ Single instance for entire app

module.exports = prisma;
