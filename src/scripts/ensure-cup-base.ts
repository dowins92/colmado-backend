import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Starting CUP base currency check for all businesses...');

    try {
        console.log('--- CLEANING UP LEGACY CONSTRAINTS ---');
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Currency" DROP CONSTRAINT IF EXISTS "Currency_code_key"');
            console.log('Dropped "Currency_code_key" index if it existed.');
        } catch (e) {
            console.log('Failed to drop "Currency_code_key" via ALTER TABLE.');
        }

        try {
            await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS "Currency_code_key"');
            console.log('Dropped "Currency_code_key" index if it existed.');
        } catch (e) { }

        const businesses = await prisma.business.findMany({
            where: { deletedAt: null }
        });

        console.log(`Found ${businesses.length} active businesses.`);

        for (const business of businesses) {
            console.log(`\n--- Checking business: ${business.name} ---`);

            const existingCup = await prisma.currency.findUnique({
                where: {
                    businessId_code: {
                        businessId: business.id,
                        code: 'CUP'
                    }
                }
            });

            if (existingCup) {
                console.log(`Found existing CUP (${existingCup.id}). Ensuring it is base...`);
                await prisma.currency.update({
                    where: { id: existingCup.id },
                    data: { isBase: true, code: 'CUP' }
                });
            } else {
                console.log(`CUP not found. Creating new CUP as base...`);
                await prisma.currency.create({
                    data: {
                        businessId: business.id,
                        code: 'CUP',
                        name: 'Peso Cubano',
                        symbol: '$',
                        isBase: true
                    }
                });
            }

            // Ensure no OTHER currency is set as base for this business
            const otherBases = await prisma.currency.findMany({
                where: { businessId: business.id, isBase: true, code: { not: 'CUP' } }
            });
            for (const other of otherBases) {
                console.log(`Unsetting extra base currency: ${other.code} for ${business.name}`);
                await prisma.currency.update({
                    where: { id: other.id },
                    data: { isBase: false }
                });
            }
        }

        console.log('✅ CUP check completed successfully!');

    } catch (error) {
        console.error('❌ Error during check:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
