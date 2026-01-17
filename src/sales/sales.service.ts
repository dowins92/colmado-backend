import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkSaleDto } from './dto/bulk-sale.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class SalesService {
    constructor(private prisma: PrismaService) { }

    async createBulkSale(dto: BulkSaleDto) {
        const { posId, items, currency, rate, customerId, paidAmount } = dto;

        return this.prisma.$transaction(async (tx) => {
            let totalCUP = 0;
            let totalUSD = 0;
            let totalMLC = 0;

            // 1. Process items and deduct from POS stock
            const saleItemsData = [];
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

                const posStock = await tx.pOSStock.findUnique({
                    where: { productId_posId: { productId: item.productId, posId } },
                });

                if (!posStock || posStock.quantity < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for product ${product.name} in POS`);
                }

                // Deduct stock
                await tx.pOSStock.update({
                    where: { productId_posId: { productId: item.productId, posId } },
                    data: { quantity: { decrement: item.quantity } },
                });

                const lineTotal = item.quantity * item.price;
                if (currency === 'CUP') totalCUP += lineTotal;
                if (currency === 'USD') totalUSD += lineTotal;
                if (currency === 'MLC') totalMLC += lineTotal;

                saleItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    costAtMoment: product.costPrice,
                });

                // Audit Stock Movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: MovementType.SALE,
                        fromLocationId: posId,
                        quantity: item.quantity,
                        costAtMoment: product.costPrice,
                        rateAtMoment: rate,
                    },
                });
            }

            // 2. Create Sale
            const sale = await tx.sale.create({
                data: {
                    posId,
                    totalCUP,
                    totalUSD,
                    totalMLC,
                    rateAtMoment: rate,
                    items: {
                        create: saleItemsData,
                    },
                },
            });

            // 3. Handle "El Fiao" (Debt)
            if (customerId) {
                const totalAmount = currency === 'CUP' ? totalCUP : (currency === 'USD' ? totalUSD : totalMLC);
                const debtAmount = totalAmount - (paidAmount ?? totalAmount);

                if (debtAmount > 0) {
                    // Get businessId from one of the sale items' product
                    const firstProduct = await tx.product.findUnique({ where: { id: items[0].productId } });
                    const dbCurrency = await tx.currency.findFirst({
                        where: { code: currency, businessId: firstProduct?.businessId }
                    });
                    if (!dbCurrency) throw new BadRequestException(`Currency ${currency} not found`);

                    await tx.debt.create({
                        data: {
                            customerId,
                            amount: debtAmount,
                            currencyId: dbCurrency.id,
                            rateAtMoment: rate,
                            saleId: sale.id,
                        },
                    });
                }
            }

            return sale;
        });
    }

    async findAll() {
        return this.prisma.sale.findMany({
            where: { deletedAt: null },
            include: {
                pointOfSale: true,
                _count: {
                    select: { items: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const sale = await this.prisma.sale.findUnique({
            where: { id, deletedAt: null },
            include: {
                pointOfSale: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                debt: true,
            },
        });

        if (!sale) {
            throw new NotFoundException(`Sale with ID ${id} not found`);
        }

        return sale;
    }
}
