-- Multi-Business Migration Script
-- This script migrates existing single-tenant data to multi-tenant architecture

-- Step 1: Create a temporary migration-friendly schema
ALTER TABLE "Currency" ADD COLUMN "businessId" TEXT;
ALTER TABLE "User" ADD COLUMN "businessId" TEXT;
ALTER TABLE "PointOfSale" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Product" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Warehouse" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "businessId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "businessId" TEXT;

-- Step 2: Create default business
INSERT INTO "Business" (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES (
  'default-business-id', 
  'Mi Negocio Principal', 
  'Negocio por defecto creado durante la migración', 
  true, 
  NOW(), 
  NOW()
);

-- Step 3: Assign all existing records to default business
UPDATE "Currency" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "User" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "PointOfSale" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Product" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Warehouse" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Customer" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Expense" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;

-- Step 4: Make businessId required (NOT NULL constraints)
ALTER TABLE "Currency" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "PointOfSale" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Warehouse" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "businessId" SET NOT NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PointOfSale" ADD CONSTRAINT "PointOfSale_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Update Role enum to include SUPERADMIN
-- Note: This will be done via Prisma
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

-- Step 7: Create unique constraint for Currency (businessId, code)
ALTER TABLE "Currency" DROP CONSTRAINT IF EXISTS "Currency_code_key";
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_businessId_code_key" UNIQUE ("businessId", "code");

-- Migration complete!
-- You can now run: npx prisma db pull && npx prisma generate
