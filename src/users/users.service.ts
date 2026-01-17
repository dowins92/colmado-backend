import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
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
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: { deletedAt: null },
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
            },
        });
    }

    async findOne(id: string) {
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
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email, deletedAt: null },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findOne(id);

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.prisma.user.update({
            where: { id: user.id },
            data: updateUserDto,
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
            },
        });
    }

    async remove(id: string) {
        const user = await this.findOne(id);

        return this.prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: new Date() },
        });
    }
}
