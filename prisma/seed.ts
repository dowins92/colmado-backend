import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Hash for 'OAD.com92.,'
    const password = '$2b$10$gvBjhNujgpjnnGaJnR.3uuTObOLdrGYkbgXhKInm8dgx0Ica.Kx0e';

    // 1. Create Default Business
    const defaultBusiness = await prisma.business.upsert({
        where: { id: 'default-business-id' },
        update: {},
        create: {
            id: 'default-business-id',
            name: 'Mi Negocio Principal',
            description: 'Negocio creado automáticamente',
            isActive: true
        }
    });

    console.log('Business seeded:', defaultBusiness.name);

    // 2. Create SUPERADMIN (Global Access)
    const superadmin = await prisma.user.upsert({
        where: { email: 'superadmin@colmado.com' },
        update: {},
        create: {
            email: 'superadmin@colmado.com',
            password,
            name: 'Super Administrator',
            role: Role.SUPERADMIN,
            // Superadmins don't strictly "belong" to one business in logic, 
            // but the DB schema requires a businessId for the user table currently.
            // They bypass business check in the Backend Guards.
            businessId: defaultBusiness.id
        },
    });

    console.log('Superadmin seeded:', superadmin.email);

    // 3. Create OWNER (Regular Admin for the default business)
    const admin = await prisma.user.upsert({
        where: { email: 'admin' },
        update: {},
        create: {
            email: 'admin',
            password,
            name: 'Administrator',
            role: Role.OWNER,
            businessId: defaultBusiness.id
        },
    });

    console.log('Owner seeded:', admin.email);

    // 4. Initial Currencies
    const currencies = [
        { code: 'CUP', name: 'Peso Cubano', symbol: '$', isBase: true },
        { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', isBase: false },
        { code: 'MLC', name: 'Moneda Libremente Convertible', symbol: 'MLC', isBase: false }
    ];

    for (const c of currencies) {
        const dbCurrency = await prisma.currency.upsert({
            where: {
                businessId_code: {
                    businessId: defaultBusiness.id,
                    code: c.code
                }
            },
            update: {},
            create: {
                ...c,
                businessId: defaultBusiness.id
            }
        });
        console.log(`Currency seeded: ${dbCurrency.code}`);
    }

    // 5. Initial Rates (relative to CUP)
    const cup = await prisma.currency.findFirst({ where: { code: 'CUP', businessId: defaultBusiness.id } });
    const usd = await prisma.currency.findFirst({ where: { code: 'USD', businessId: defaultBusiness.id } });
    const mlc = await prisma.currency.findFirst({ where: { code: 'MLC', businessId: defaultBusiness.id } });

    if (usd && mlc) {
        await prisma.currencyRate.createMany({
            data: [
                { currencyId: usd.id, rate: 320 },
                { currencyId: mlc.id, rate: 270 }
            ],
            skipDuplicates: true
        });
        console.log('Rates seeded');
    }

    console.log('--- SEED COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
