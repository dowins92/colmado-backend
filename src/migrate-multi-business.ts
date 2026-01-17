import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('🚀 Starting multi-business migration...');

        const sqlScript = fs.readFileSync(
            path.join(__dirname, '../prisma/migrations/multi-business-migration.sql'),
            'utf-8'
        );

        // Split by semicolons and filter out comments and empty statements
        const statements = sqlScript
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 60)}...`);
                await prisma.$executeRawUnsafe(statement);
            }
        }

        console.log('✅ Migration completed successfully!');
        console.log('📊 Summary:');
        console.log('  - Created default business: "Mi Negocio Principal"');
        console.log('  - Migrated all existing records to default business');
        console.log('  - Added foreign key constraints');
        console.log('  - Updated Role enum with SUPERADMIN');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
