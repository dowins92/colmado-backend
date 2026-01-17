import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockTransferDto } from './dto/stock-transfer.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class StockService {
    constructor(private prisma: PrismaService) { }

    async entry(dto: StockEntryDto) {
        const { productId, warehouseId, quantity, totalCost, rate, currencyCode } = dto;
        const costPrice = quantity > 0 ? totalCost / quantity : 0;

        return this.prisma.$transaction(async (tx) => {
            // Updated Warehouse Stock
            await tx.warehouseStock.upsert({
                where: { productId_warehouseId: { productId, warehouseId } },
                update: { quantity: { increment: quantity } },
                create: { productId, warehouseId, quantity },
            });

            // Update product prices
            await tx.product.update({
                where: { id: productId },
                data: { costPrice },
            });

            // Audit Movement
            return tx.stockMovement.create({
                data: {
                    productId,
                    type: MovementType.ENTRY,
                    toLocationId: warehouseId,
                    quantity,
                    costAtMoment: costPrice,
                    rateAtMoment: rate,
                },
            });
        });
    }

    async transfer(dto: StockTransferDto) {
        const { productId, fromLocationId, toLocationId, quantity, rate } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Deduct from source (Warehouse or POS)
            const warehouseSource = await tx.warehouseStock.findUnique({
                where: { productId_warehouseId: { productId, warehouseId: fromLocationId } },
            });

            if (warehouseSource) {
                if (warehouseSource.quantity < quantity) throw new BadRequestException('Insufficient stock in source warehouse');
                await tx.warehouseStock.update({
                    where: { productId_warehouseId: { productId, warehouseId: fromLocationId } },
                    data: { quantity: { decrement: quantity } },
                });
            } else {
                const posSource = await tx.pOSStock.findUnique({
                    where: { productId_posId: { productId, posId: fromLocationId } },
                });
                if (!posSource || posSource.quantity < quantity) throw new BadRequestException('Insufficient stock in source POS');
                await tx.pOSStock.update({
                    where: { productId_posId: { productId, posId: fromLocationId } },
                    data: { quantity: { decrement: quantity } },
                });
            }

            // 2. Add to destination
            const isDestinationPOS = await tx.pointOfSale.findUnique({ where: { id: toLocationId } });

            if (isDestinationPOS) {
                await tx.pOSStock.upsert({
                    where: { productId_posId: { productId, posId: toLocationId } },
                    update: { quantity: { increment: quantity } },
                    create: { productId, posId: toLocationId, quantity },
                });
            } else {
                await tx.warehouseStock.upsert({
                    where: { productId_warehouseId: { productId, warehouseId: toLocationId } },
                    update: { quantity: { increment: quantity } },
                    create: { productId, warehouseId: toLocationId, quantity },
                });
            }

            // 3. Audit
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

            return tx.stockMovement.create({
                data: {
                    productId,
                    type: MovementType.TRANSFER,
                    fromLocationId,
                    toLocationId,
                    quantity,
                    costAtMoment: product.costPrice,
                    rateAtMoment: rate,
                },
            });
        });
    }

    async findAllMovements() {
        return this.prisma.stockMovement.findMany({
            include: {
                product: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findProductStock(productId: string) {
        const warehouseStock = await this.prisma.warehouseStock.findMany({
            where: { productId },
            include: { warehouse: true },
        });

        const posStock = await this.prisma.pOSStock.findMany({
            where: { productId },
            include: { pointOfSale: true },
        });

        return {
            warehouseStock,
            posStock,
        };
    }

    async findAvailableStock() {
        const products = await this.prisma.product.findMany({
            where: { deletedAt: null },
            include: {
                warehouseStock: true,
                posStock: true,
            },
        });

        return products
            .map((product) => {
                const totalWarehouse = product.warehouseStock.reduce((acc, s) => acc + s.quantity, 0);
                const totalPOS = product.posStock.reduce((acc, s) => acc + s.quantity, 0);
                return {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    unit: product.unit,
                    totalStock: totalWarehouse + totalPOS,
                    warehouseBreakdown: product.warehouseStock,
                    posBreakdown: product.posStock,
                };
            })
            .filter((p) => p.totalStock > 0);
    }
}
