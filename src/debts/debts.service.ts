import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class DebtsService {
    constructor(private prisma: PrismaService) { }

    async create(createDebtDto: CreateDebtDto) {
        const { currencyCode, ...data } = createDebtDto;

        // Default to CUP if no currencyCode provided
        const code = (currencyCode || 'CUP').toUpperCase();

        const currency = await this.prisma.currency.findUnique({
            where: { code },
        });

        if (!currency) {
            throw new NotFoundException(`Currency ${code} not found`);
        }

        return this.prisma.debt.create({
            data: {
                ...data,
                currencyId: currency.id,
            },
        });
    }

    async createPayment(createPaymentDto: CreatePaymentDto) {
        const { currencyCode, debtId, ...data } = createPaymentDto;

        const debt = await this.prisma.debt.findUnique({
            where: { id: debtId },
        });

        if (!debt) {
            throw new NotFoundException(`Debt with ID ${debtId} not found`);
        }

        const currency = await this.prisma.currency.findUnique({
            where: { code: currencyCode.toUpperCase() },
        });

        if (!currency) {
            throw new NotFoundException(`Currency ${currencyCode} not found`);
        }

        return this.prisma.debtPayment.create({
            data: {
                ...data,
                debtId,
                currencyId: currency.id,
            },
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
