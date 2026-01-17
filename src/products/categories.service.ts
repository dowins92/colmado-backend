import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto, businessId: string) {
        const existing = await this.prisma.category.findUnique({
            where: {
                businessId_name: {
                    businessId,
                    name: createCategoryDto.name,
                },
            },
        });

        if (existing) {
            throw new ConflictException(`La categoría ${createCategoryDto.name} ya existe en este negocio.`);
        }

        return this.prisma.category.create({
            data: {
                ...createCategoryDto,
                businessId,
            },
        });
    }

    async findAll(businessId: string) {
        return this.prisma.category.findMany({
            where: { businessId },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
    }

    async findOne(id: string, businessId: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!category || category.businessId !== businessId) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto, businessId: string) {
        await this.findOne(id, businessId);

        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string, businessId: string) {
        await this.findOne(id, businessId);

        // Check if category has products
        const productsCount = await this.prisma.product.count({
            where: { categoryId: id, deletedAt: null },
        });

        if (productsCount > 0) {
            throw new ConflictException('No se puede eliminar una categoría que tiene productos asociados.');
        }

        return this.prisma.category.delete({
            where: { id },
        });
    }
}
