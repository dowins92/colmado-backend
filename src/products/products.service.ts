import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, businessId: string) {
        return this.prisma.product.create({
            data: {
                ...createProductDto,
                businessId,
            },
        });
    }

    async findAll(businessId: string) {
        return this.prisma.product.findMany({
            where: { deletedAt: null, businessId },
        });
    }

    async findOne(id: string, businessId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                warehouseStock: true,
                posStock: true,
            },
        });

        if (!product || product.businessId !== businessId) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
    }

    async remove(id: string, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
