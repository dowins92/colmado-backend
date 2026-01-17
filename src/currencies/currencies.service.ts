import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto, CreateCurrencyDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class CurrenciesService {
    constructor(private prisma: PrismaService) { }

    async createCurrency(createCurrencyDto: CreateCurrencyDto) {
        return this.prisma.currency.create({
            data: createCurrencyDto,
        });
    }

    async getCurrencies() {
        return this.prisma.currency.findMany({
            orderBy: { code: 'asc' },
        });
    }

    async updateRate(createExchangeRateDto: CreateExchangeRateDto) {
        const currency = await this.prisma.currency.findUnique({
            where: { code: createExchangeRateDto.currencyCode },
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

    async getLatestRates() {
        const currencies = await this.prisma.currency.findMany();
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
}
