-- Part 2: Add businessId columns and migrate data

-- Add businessId columns (nullable first)
ALTER TABLE "Currency" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "PointOfSale" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "Warehouse" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "businessId" TEXT;

-- Create default business
INSERT INTO "Business" (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES (
  'default-business-id', 
  'Mi Negocio Principal', 
  'Negocio por defecto creado durante la migración', 
  true, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Assign all existing records to default business
UPDATE "Currency" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "User" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "PointOfSale" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Product" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Warehouse" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Customer" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;
UPDATE "Expense" SET "businessId" = 'default-business-id' WHERE "businessId" IS NULL;

-- Make businessId NOT NULL
ALTER TABLE "Currency" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "PointOfSale" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Warehouse" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "businessId" SET NOT NULL;

-- Add foreign key constraints
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

-- Add foreign keys for UserBusinessAccess junction table
ALTER TABLE "UserBusinessAccess" ADD CONSTRAINT "UserBusinessAccess_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserBusinessAccess" ADD CONSTRAINT "UserBusinessAccess_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Currency unique constraint (drop old, add new with businessId)
ALTER TABLE "Currency" DROP CONSTRAINT IF EXISTS "Currency_code_key";
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_businessId_code_key" UNIQUE ("businessId", "code");
