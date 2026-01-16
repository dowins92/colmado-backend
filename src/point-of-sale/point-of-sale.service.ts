import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePointOfSaleDto } from './dto/create-point-of-sale.dto';
import { UpdatePointOfSaleDto } from './dto/update-point-of-sale.dto';

@Injectable()
export class PointOfSaleService {
    constructor(private prisma: PrismaService) { }

    async create(createPointOfSaleDto: CreatePointOfSaleDto) {
        return this.prisma.pointOfSale.create({
            data: createPointOfSaleDto,
        });
    }

    async findAll() {
        return this.prisma.pointOfSale.findMany({
            where: { deletedAt: null },
        });
    }

    async findOne(id: string) {
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

        if (!pos) {
            throw new NotFoundException(`Point of Sale with ID ${id} not found`);
        }

        return pos;
    }

    async update(id: string, updatePointOfSaleDto: UpdatePointOfSaleDto) {
        await this.findOne(id);
        return this.prisma.pointOfSale.update({
            where: { id },
            data: updatePointOfSaleDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.pointOfSale.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
