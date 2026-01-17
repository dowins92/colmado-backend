import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
            role: Role.OWNER,
        },
    });

    console.log({ admin });

    // Initial Currencies
    const cup = await prisma.currency.upsert({
        where: { code: 'CUP' },
        update: {},
        create: {
            code: 'CUP',
            name: 'Peso Cubano',
            symbol: '$',
            isBase: true
        }
    });

    const usd = await prisma.currency.upsert({
        where: { code: 'USD' },
        update: {},
        create: {
            code: 'USD',
            name: 'Dólar Estadounidense',
            symbol: 'US$',
            isBase: false
        }
    });

    const mlc = await prisma.currency.upsert({
        where: { code: 'MLC' },
        update: {},
        create: {
            code: 'MLC',
            name: 'Moneda Libremente Convertible',
            symbol: 'MLC',
            isBase: false
        }
    });

    console.log('Currencies seeded:', { cup, usd, mlc });

    // Initial Rates (CUP as base is 1, so we set others relative to it)
    await prisma.currencyRate.createMany({
        data: [
            { currencyId: usd.id, rate: 320 },
            { currencyId: mlc.id, rate: 270 }
        ]
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
