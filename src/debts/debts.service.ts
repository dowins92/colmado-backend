import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class DebtsService {
    constructor(private prisma: PrismaService) { }

    async create(createDebtDto: CreateDebtDto) {
        return this.prisma.debt.create({
            data: createDebtDto,
        });
    }

    async createPayment(createPaymentDto: CreatePaymentDto) {
        const debt = await this.prisma.debt.findUnique({
            where: { id: createPaymentDto.debtId },
        });

        if (!debt) {
            throw new NotFoundException(`Debt with ID ${createPaymentDto.debtId} not found`);
        }

        return this.prisma.debtPayment.create({
            data: createPaymentDto,
        });
    }

    async findAll() {
        return this.prisma.debt.findMany({
            where: { deletedAt: null },
            include: {
                customer: true,
                payments: true,
            },
        });
    }

    async findOne(id: string) {
        const debt = await this.prisma.debt.findUnique({
            where: { id, deletedAt: null },
            include: {
                customer: true,
                payments: true,
                sale: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });

        if (!debt) {
            throw new NotFoundException(`Debt with ID ${id} not found`);
        }

        return debt;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.debt.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
