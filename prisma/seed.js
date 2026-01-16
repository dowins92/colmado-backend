require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('oad.com92', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin' },
        update: {},
        create: {
            email: 'admin',
            password,
            name: 'Administrator',
            role: 'OWNER',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
