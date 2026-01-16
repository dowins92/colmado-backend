import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(createCustomerDto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }

    async findAll() {
        return this.prisma.customer.findMany({
            where: { deletedAt: null },
        });
    }

    async findOne(id: string) {
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

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto) {
        await this.findOne(id);
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
