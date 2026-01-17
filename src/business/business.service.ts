import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
    constructor(private prisma: PrismaService) { }

    async create(createBusinessDto: CreateBusinessDto) {
        return this.prisma.business.create({
            data: createBusinessDto,
        });
    }

    async findAll() {
        return this.prisma.business.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: {
                        users: true,
                        warehouses: true,
                        pointsOfSale: true,
                        products: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const business = await this.prisma.business.findUnique({
            where: { id, deletedAt: null },
            include: {
                warehouses: true,
                pointsOfSale: true,
                _count: {
                    select: {
                        users: true,
                        products: true,
                        customers: true,
                    }
                }
            }
        });

        if (!business) {
            throw new NotFoundException(`Business with ID ${id} not found`);
        }

        return business;
    }

    async update(id: string, updateBusinessDto: UpdateBusinessDto) {
        await this.findOne(id); // Verify exists
        return this.prisma.business.update({
            where: { id },
            data: updateBusinessDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id); // Verify exists
        return this.prisma.business.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async findByUserId(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                business: true,
                businessAccess: {
                    include: {
                        business: true
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        // If user is SUPERADMIN, return all businesses
        if (user.role === 'SUPERADMIN') {
            return this.prisma.business.findMany({
                where: { deletedAt: null }
            });
        }

        // Return primary business + all businesses with access
        const businesses = [
            user.business,
            ...user.businessAccess.map(ba => ba.business)
        ];

        // Remove duplicates by id
        return businesses.filter((business, index, self) =>
            index === self.findIndex(b => b.id === business.id)
        );
    }
}
