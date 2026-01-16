import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Seed Admin User
        const password = await bcrypt.hash('oad.com92', 10);
        const adminId = crypto.randomUUID();
        await client.query(`
            INSERT INTO "User" (id, email, name, password, role, "updatedAt")
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (email) DO UPDATE 
            SET password = EXCLUDED.password, name = EXCLUDED.name, role = EXCLUDED.role, "updatedAt" = NOW();
        `, [adminId, 'admin', 'Administrator', password, 'OWNER']);
        console.log('Admin user seeded');

        // 2. Seed Default Warehouse
        const warehouseId = crypto.randomUUID();
        await client.query(`
            INSERT INTO "Warehouse" (id, name, location, "createdAt")
            VALUES ($1, 'Almacén Principal', 'Sede Central', NOW())
            ON CONFLICT DO NOTHING;
        `, [warehouseId]);

        // Get the actual warehouse ID (in case ON CONFLICT triggered)
        const warehouseRes = await client.query('SELECT id FROM "Warehouse" LIMIT 1');
        const activeWarehouseId = warehouseRes.rows[0].id;
        console.log('Warehouse initialized:', activeWarehouseId);

        // 3. Seed Default Point of Sale
        const posId = crypto.randomUUID();
        await client.query(`
            INSERT INTO "PointOfSale" (id, name, location, "createdAt")
            VALUES ($1, 'Caja Principal', 'Mostrador', NOW())
            ON CONFLICT DO NOTHING;
        `, [posId]);

        const posRes = await client.query('SELECT id FROM "PointOfSale" LIMIT 1');
        const activePosId = posRes.rows[0].id;
        console.log('Point of Sale initialized:', activePosId);

        // 4. Seed Example Products
        const products = [
            { name: 'Arroz 1kg', category: 'Granos', unit: 'kg', cost: 150, selling: 250 },
            { name: 'Aceite Vegetal 1L', category: 'Líquidos', unit: 'btl', cost: 450, selling: 700 },
            { name: 'Cerveza Cristal', category: 'Bebidas', unit: 'can', cost: 180, selling: 280 },
            { name: 'Detergente Polvo 500g', category: 'Limpieza', unit: 'pkg', cost: 120, selling: 200 },
            { name: 'Refresco 1.5L', category: 'Bebidas', unit: 'btl', cost: 220, selling: 350 },
        ];

        for (const p of products) {
            const productId = crypto.randomUUID();
            await client.query(`
                INSERT INTO "Product" (id, name, category, unit, "costPrice", "sellingPriceCUP", "updatedAt", "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            `, [productId, p.name, p.category, p.unit, p.cost, p.selling]);

            // Get the actual product ID
            const prodRes = await client.query('SELECT id FROM "Product" WHERE name = $1', [p.name]);
            const actualProductId = prodRes.rows[0].id;

            // 5. Initialize Stock Levels (50 in Warehouse, 20 in POS)
            await client.query(`
                INSERT INTO "WarehouseStock" (id, "productId", "warehouseId", quantity)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("productId", "warehouseId") DO UPDATE SET quantity = EXCLUDED.quantity;
            `, [crypto.randomUUID(), actualProductId, activeWarehouseId, 50]);

            await client.query(`
                INSERT INTO "POSStock" (id, "productId", "posId", quantity)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT ("productId", "posId") DO UPDATE SET quantity = EXCLUDED.quantity;
            `, [crypto.randomUUID(), actualProductId, activePosId, 20]);
        }

        console.log('Products and stock levels seeded successfully');

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.end();
    }
}

seed();
