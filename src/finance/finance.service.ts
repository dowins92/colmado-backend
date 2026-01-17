import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExpenseDto, CurrencyRateDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
    constructor(private prisma: PrismaService) { }

    async createExpense(dto: ExpenseDto, businessId: string) {
        const currency = await this.prisma.currency.findFirst({
            where: { code: dto.currencyCode, businessId },
        });

        if (!currency) {
            throw new Error(`Currency ${dto.currencyCode} not found`);
        }

        const { currencyCode, ...data } = dto;
        return this.prisma.expense.create({
            data: {
                ...data,
                currencyId: currency.id,
                businessId,
            },
        });
    }

    async createCurrencyRate(dto: CurrencyRateDto, businessId: string) {
        const currency = await this.prisma.currency.findFirst({
            where: { code: dto.currencyCode, businessId },
        });

        if (!currency) {
            throw new Error(`Currency ${dto.currencyCode} not found`);
        }

        return this.prisma.currencyRate.create({
            data: {
                currencyId: currency.id,
                rate: dto.rate,
            },
        });
    }

    async getDailySummary(date: Date) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const baseCurrency = await this.prisma.currency.findFirst({
            where: { isBase: true },
        });

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
            include: { currency: true },
        });

        const expenses = await this.prisma.expense.findMany({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay },
                deletedAt: null,
            },
            include: { currency: true },
        });

        const totals = {
            salesCUP: sales.reduce((acc: number, s: any) => acc + s.totalCUP, 0),
            salesUSD: sales.reduce((acc: number, s: any) => acc + s.totalUSD, 0),
            salesMLC: sales.reduce((acc: number, s: any) => acc + s.totalMLC, 0),
            debtPaymentsCUP: debtPayments.reduce((acc: number, p: any) => acc + (p.currency.isBase ? p.amount : 0), 0),
            expensesCUP: expenses.reduce((acc: number, e: any) => acc + (e.currency.isBase ? e.amount : 0), 0),
        };

        return {
            ...totals,
            cashInHandCUP: totals.salesCUP + totals.debtPaymentsCUP - totals.expensesCUP,
        };
    }

    async findAllExpenses() {
        return this.prisma.expense.findMany({
            where: { deletedAt: null },
            include: { currency: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findRates() {
        return this.prisma.currencyRate.findMany({
            include: { currency: true },
            orderBy: { createdAt: 'desc' },
            take: 30, // Last 30 rates
        });
    }
}
