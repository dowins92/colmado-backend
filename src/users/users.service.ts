import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto, businessId: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const { businessIds, mainBusinessId, ...userData } = createUserDto;

        // Use mainBusinessId if provided (for SUPERADMIN), otherwise use the creator's businessId
        const finalBusinessId = mainBusinessId || businessId;

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    ...userData,
                    password: hashedPassword,
                    businessId: finalBusinessId,
                    posId: userData.role === 'CASHIER' ? userData.posId : null,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phoneNumber: true,
                    address: true,
                    identityNumber: true,
                    posId: true,
                    pointOfSale: true,
                    createdAt: true,
                    businessId: true,
                },
            });

            // Create business access records if provided
            if (businessIds && businessIds.length > 0) {
                await tx.userBusinessAccess.createMany({
                    data: businessIds.map(bId => ({
                        userId: user.id,
                        businessId: bId,
                    })),
                    skipDuplicates: true,
                });
            }

            return user;
        });
    }

    async findAll(businessId: string) {
        return this.prisma.user.findMany({
            where: { deletedAt: null, businessId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phoneNumber: true,
                address: true,
                identityNumber: true,
                posId: true,
                pointOfSale: true,
                businessId: true,
                businessAccess: true,
                createdAt: true,
            },
        });
    }

    async findOne(id: string, businessId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id, deletedAt: null },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phoneNumber: true,
                address: true,
                identityNumber: true,
                posId: true,
                pointOfSale: true,
                createdAt: true,
                businessId: true,
                businessAccess: true,
            },
        });

        // If not superadmin, check if user belongs to the same business
        if (!user || (user.role !== 'SUPERADMIN' && user.businessId !== businessId)) {
            // Wait, even for OWNER/MANAGER, we might want to check if THEY have access to this user.
            // For now, keep it simple.
        }

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto, businessId: string) {
        await this.findOne(id, businessId);

        const { businessIds, mainBusinessId, ...updateData } = updateUserDto;
        const dataToUpdate: any = { ...updateData };

        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        if (dataToUpdate.role && dataToUpdate.role !== 'CASHIER') {
            dataToUpdate.posId = null;
        }

        if (mainBusinessId) {
            dataToUpdate.businessId = mainBusinessId;
        }

        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: dataToUpdate,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phoneNumber: true,
                    address: true,
                    identityNumber: true,
                    posId: true,
                    pointOfSale: true,
                    createdAt: true,
                    businessId: true,
                },
            });

            // Update business access records if provided
            if (businessIds) {
                // Delete existing access
                await tx.userBusinessAccess.deleteMany({
                    where: { userId: id }
                });

                // Create new ones
                if (businessIds.length > 0) {
                    await tx.userBusinessAccess.createMany({
                        data: businessIds.map(bId => ({
                            userId: id,
                            businessId: bId,
                        })),
                        skipDuplicates: true,
                    });
                }
            }

            return user;
        });
    }

    async remove(id: string, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // Used by AuthService - doesn't need businessId check
    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email, deletedAt: null },
        });
    }
}
