import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto, CreateCurrencyDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class CurrenciesService {
    constructor(private prisma: PrismaService) { }

    async createCurrency(createCurrencyDto: CreateCurrencyDto, businessId: string) {
        if (!businessId) {
            throw new BadRequestException('Business context is required');
        }

        const normalizedCode = createCurrencyDto.code.toUpperCase();
        console.log(`[CurrenciesService] Attempting to create currency: code=${normalizedCode}, businessId=${businessId}`);

        // Logic enforcement: CUP is ALWAYS the base currency
        if (normalizedCode === 'CUP') {
            createCurrencyDto.isBase = true;
        } else if (createCurrencyDto.isBase) {
            // If they try to set another currency as base, reject it
            throw new BadRequestException('Solo el CUP puede ser la moneda base del sistema.');
        }

        // Check if currency already exists for this business
        const existing = await this.prisma.currency.findUnique({
            where: {
                businessId_code: {
                    businessId,
                    code: normalizedCode,
                },
            },
        });

        if (existing) {
            console.warn(`[CurrenciesService] Conflict found: ${normalizedCode} already exists for business ${businessId}`);
            throw new ConflictException(`La moneda ${normalizedCode} ya está registrada en este negocio.`);
        }

        // Extra safety check for multiple base currencies (redundant but good)
        if (createCurrencyDto.isBase) {
            const baseCurrency = await this.prisma.currency.findFirst({
                where: { businessId, isBase: true },
            });
            if (baseCurrency) {
                throw new ConflictException(`Este negocio ya tiene una moneda base (${baseCurrency.code}). No se puede añadir otra.`);
            }
        }

        return this.prisma.currency.create({
            data: {
                ...createCurrencyDto,
                code: normalizedCode,
                businessId,
            },
        });
    }

    async getCurrencies(businessId: string) {
        return this.prisma.currency.findMany({
            where: { businessId },
            orderBy: { code: 'asc' },
        });
    }

    async updateRate(createExchangeRateDto: CreateExchangeRateDto, businessId: string) {
        const currency = await this.prisma.currency.findFirst({
            where: {
                code: createExchangeRateDto.currencyCode,
                businessId,
            },
        });

        if (!currency) {
            throw new NotFoundException(`Currency with code ${createExchangeRateDto.currencyCode} not found`);
        }

        return this.prisma.currencyRate.create({
            data: {
                currencyId: currency.id,
                rate: createExchangeRateDto.rate,
            },
        });
    }

    async getLatestRates(businessId: string) {
        const currencies = await this.prisma.currency.findMany({
            where: { businessId },
        });
        const rates: Record<string, number> = {};

        for (const currency of currencies) {
            if (currency.isBase) {
                rates[currency.code.toLowerCase()] = 1;
                continue;
            }

            const latestRate = await this.prisma.currencyRate.findFirst({
                where: { currencyId: currency.id },
                orderBy: { createdAt: 'desc' },
            });

            rates[currency.code.toLowerCase()] = latestRate ? latestRate.rate : 0;
        }

        return rates;
    }

    async remove(id: string, businessId: string) {
        const currency = await this.prisma.currency.findFirst({
            where: { id, businessId },
            include: {
                _count: {
                    select: {
                        debts: true,
                        payments: true,
                        expenses: true,
                    },
                },
            },
        });

        if (!currency) {
            throw new NotFoundException(`Currency with ID ${id} not found for this business`);
        }

        if (currency.isBase) {
            throw new BadRequestException('Cannot delete the base currency');
        }

        if (currency._count.debts > 0 || currency._count.payments > 0 || currency._count.expenses > 0) {
            throw new ConflictException(
                `Cannot delete currency ${currency.code} because it has associated transactions (Debts: ${currency._count.debts}, Payments: ${currency._count.payments}, Expenses: ${currency._count.expenses})`
            );
        }

        // Delete associated rates first (Prisma doesn't support manual onDelete Cascade in all cases or we might want to be explicit)
        await this.prisma.currencyRate.deleteMany({
            where: { currencyId: id },
        });

        return this.prisma.currency.delete({
            where: { id },
        });
    }
}
