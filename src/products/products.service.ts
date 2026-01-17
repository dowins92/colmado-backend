import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto, businessId: string) {
        if (createProductDto.sku) {
            const existing = await this.prisma.product.findUnique({
                where: {
                    businessId_sku: {
                        businessId,
                        sku: createProductDto.sku,
                    },
                },
            });

            if (existing) {
                throw new ConflictException(`Un producto con el SKU ${createProductDto.sku} ya existe en este negocio.`);
            }
        }

        return this.prisma.product.create({
            data: {
                ...createProductDto,
                businessId,
            },
            include: {
                category: true,
            },
        });
    }

    async findAll(businessId: string) {
        return this.prisma.product.findMany({
            where: { deletedAt: null, businessId },
            include: {
                category: true,
                _count: {
                    select: {
                        warehouseStock: true,
                        posStock: true,
                    },
                },
            },
        });
    }

    async findOne(id: string, businessId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id, deletedAt: null },
            include: {
                category: true,
                warehouseStock: {
                    include: { warehouse: true }
                },
                posStock: {
                    include: { pointOfSale: true }
                },
            },
        });

        if (!product || product.businessId !== businessId) {
            throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto, businessId: string) {
        await this.findOne(id, businessId);

        if (updateProductDto.sku) {
            const existing = await this.prisma.product.findFirst({
                where: {
                    businessId,
                    sku: updateProductDto.sku,
                    id: { not: id },
                },
            });

            if (existing) {
                throw new ConflictException(`El SKU ${updateProductDto.sku} ya está en uso por otro producto.`);
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: updateProductDto,
            include: {
                category: true,
            },
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
