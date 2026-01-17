import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';

@Injectable()
export class PointOfSaleService {
    constructor(private prisma: PrismaService) { }

    async create(createPointOfSaleDto: CreatePointOfSaleDto, businessId: string) {
        return this.prisma.pointOfSale.create({
            data: {
                ...createPointOfSaleDto,
                businessId,
            },
        });
    }

    async findAll(businessId: string) {
        return this.prisma.pointOfSale.findMany({
            where: { deletedAt: null, businessId },
        });
    }

    async findOne(id: string, businessId: string) {
        const pos = await this.prisma.pointOfSale.findUnique({
            where: { id, deletedAt: null },
            include: {
                stocks: {
                    include: {
                        product: true,
                    },
                },
                sales: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!pos || pos.businessId !== businessId) {
            throw new NotFoundException(`Point of Sale with ID ${id} not found`);
        }

        return pos;
    }

    async update(id: string, updatePointOfSaleDto: UpdatePointOfSaleDto, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.pointOfSale.update({
            where: { id },
            data: updatePointOfSaleDto,
        });
    }

    async remove(id: string, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.pointOfSale.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
