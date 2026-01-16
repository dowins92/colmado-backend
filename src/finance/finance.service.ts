import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseDto, CurrencyRateDto } from './dto/finance.dto';
import { Currency } from '@prisma/client';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async createExpense(dto: ExpenseDto) {
        return this.prisma.expense.create({
            data: dto,
        });
    }

    async createCurrencyRate(dto: CurrencyRateDto) {
        return this.prisma.currencyRate.create({
            data: dto,
        });
    }

    async getDailySummary(date: Date) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const sales = await this.prisma.sale.findMany({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay },
                deletedAt: null,
            },
        });

        const debtPayments = await this.prisma.debtPayment.findMany({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay },
            },
        });

        const expenses = await this.prisma.expense.findMany({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay },
                deletedAt: null,
            },
        });

        const totals = {
            salesCUP: sales.reduce((acc, s) => acc + s.totalCUP, 0),
            salesUSD: sales.reduce((acc, s) => acc + s.totalUSD, 0),
            salesMLC: sales.reduce((acc, s) => acc + s.totalMLC, 0),
            debtPaymentsCUP: debtPayments.reduce((acc, p) => acc + (p.currency === Currency.CUP ? p.amount : 0), 0),
            expensesCUP: expenses.reduce((acc, e) => acc + (e.currency === Currency.CUP ? e.amount : 0), 0),
        };

        return {
            ...totals,
            cashInHandCUP: totals.salesCUP + totals.debtPaymentsCUP - totals.expensesCUP,
        };
    }

    async findAllExpenses() {
        return this.prisma.expense.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findRates() {
        return this.prisma.currencyRate.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30, // Last 30 rates
        });
    }
}
