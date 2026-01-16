import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
    constructor(private prisma: PrismaService) { }

    async create(createWarehouseDto: CreateWarehouseDto) {
        return this.prisma.warehouse.create({
            data: createWarehouseDto,
        });
    }

    async findAll() {
        return this.prisma.warehouse.findMany({
            where: { deletedAt: null },
        });
    }

    async findOne(id: string) {
        const warehouse = await this.prisma.warehouse.findUnique({
            where: { id, deletedAt: null },
            include: {
                stocks: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${id} not found`);
        }

        return warehouse;
    }

    async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
        await this.findOne(id);
        return this.prisma.warehouse.update({
            where: { id },
            data: updateWarehouseDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.warehouse.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
