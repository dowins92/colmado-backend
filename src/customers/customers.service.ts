import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(createCustomerDto: CreateCustomerDto, businessId: string) {
        return this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                businessId,
            },
        });
    }

    async findAll(businessId: string) {
        return this.prisma.customer.findMany({
            where: { deletedAt: null, businessId },
        });
    }

    async findOne(id: string, businessId: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id, deletedAt: null },
            include: {
                debts: {
                    include: {
                        payments: true,
                    },
                },
            },
        });

        if (!customer || customer.businessId !== businessId) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }

    async remove(id: string, businessId: string) {
        await this.findOne(id, businessId);
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
